package com.yds.sorufiltreleme;

import android.app.Activity;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "GooglePlayBilling")
public class GooglePlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    private static final String TAG = "GooglePlayBilling";
    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall = null;

    @Override
    public void load() {
        super.load();
        initBillingClient();
    }

    private void initBillingClient() {
        if (billingClient != null) return;
        try {
            PendingPurchasesParams pendingPurchasesParams = PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .build();

            billingClient = BillingClient.newBuilder(getContext())
                .setListener(this)
                .enablePendingPurchases(pendingPurchasesParams)
                .build();

            startBillingConnection(null);
        } catch (Exception e) {
            Log.e(TAG, "Error initializing BillingClient", e);
        }
    }

    private void startBillingConnection(final Runnable onConnected) {
        if (billingClient == null) return;
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "BillingClient connected successfully.");
                    if (onConnected != null) {
                        onConnected.run();
                    }
                } else {
                    Log.w(TAG, "BillingClient setup failed with code: " + billingResult.getResponseCode());
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                Log.w(TAG, "Billing service disconnected, will reconnect on next call.");
            }
        });
    }

    private void ensureConnected(final Runnable action, final PluginCall callToRejectOnError) {
        if (billingClient == null) {
            initBillingClient();
        }
        if (billingClient != null && billingClient.isReady()) {
            action.run();
        } else {
            startBillingConnection(() -> {
                if (billingClient != null && billingClient.isReady()) {
                    action.run();
                } else if (callToRejectOnError != null) {
                    callToRejectOnError.reject("Google Play faturalandırma servisine bağlanılamadı.");
                }
            });
        }
    }

    @PluginMethod
    public void queryPurchases(final PluginCall call) {
        ensureConnected(() -> {
            QueryPurchasesParams queryPurchasesParams = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build();

            billingClient.queryPurchasesAsync(queryPurchasesParams, (billingResult, purchases) -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
                    boolean hasRemoveAds = false;
                    for (Purchase purchase : purchases) {
                        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                            List<String> products = purchase.getProducts();
                            if (products != null && products.contains("remove_ads")) {
                                hasRemoveAds = true;
                                acknowledgePurchaseIfNeeded(purchase);
                                break;
                            }
                        }
                    }
                    JSObject ret = new JSObject();
                    ret.put("hasPurchased", hasRemoveAds);
                    ret.put("isAdFree", hasRemoveAds);
                    call.resolve(ret);
                } else {
                    JSObject ret = new JSObject();
                    ret.put("hasPurchased", false);
                    ret.put("isAdFree", false);
                    call.resolve(ret);
                }
            });
        }, call);
    }

    @PluginMethod
    public void getProductDetails(final PluginCall call) {
        final String productId = call.getString("productId", "remove_ads");
        ensureConnected(() -> {
            List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
            productList.add(
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(productId)
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build()
            );

            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

            billingClient.queryProductDetailsAsync(params, (billingResult, result) -> {
                List<ProductDetails> productDetailsList = result != null ? result.getProductDetailsList() : null;
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && productDetailsList != null && !productDetailsList.isEmpty()) {
                    ProductDetails details = productDetailsList.get(0);
                    JSObject ret = new JSObject();
                    ret.put("productId", details.getProductId());
                    ret.put("title", details.getTitle());
                    ret.put("description", details.getDescription());
                    ProductDetails.OneTimePurchaseOfferDetails oneTime = details.getOneTimePurchaseOfferDetails();
                    if (oneTime != null) {
                        ret.put("formattedPrice", oneTime.getFormattedPrice());
                        ret.put("priceAmountMicros", oneTime.getPriceAmountMicros());
                        ret.put("priceCurrencyCode", oneTime.getPriceCurrencyCode());
                    }
                    call.resolve(ret);
                } else {
                    call.reject("Ürün bilgileri Google Play'den alınamadı: " + billingResult.getDebugMessage());
                }
            });
        }, call);
    }

    @PluginMethod
    public void purchase(final PluginCall call) {
        final String productId = call.getString("productId", "remove_ads");
        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Aktivite bulunamadı.");
            return;
        }

        ensureConnected(() -> {
            List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
            productList.add(
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(productId)
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build()
            );

            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

            billingClient.queryProductDetailsAsync(params, (billingResult, result) -> {
                List<ProductDetails> productDetailsList = result != null ? result.getProductDetailsList() : null;
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && productDetailsList != null && !productDetailsList.isEmpty()) {
                    ProductDetails details = productDetailsList.get(0);
                    List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
                    productDetailsParamsList.add(
                        BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(details)
                            .build()
                    );

                    BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(productDetailsParamsList)
                        .build();

                    pendingPurchaseCall = call;
                    billingClient.launchBillingFlow(activity, billingFlowParams);
                } else {
                    call.reject("Satın alma başlatılamadı. Ürün Google Play'de bulunamadı: " + billingResult.getDebugMessage());
                }
            });
        }, call);
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, @Nullable List<Purchase> purchases) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            boolean hasRemoveAds = false;
            for (Purchase purchase : purchases) {
                if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    List<String> products = purchase.getProducts();
                    if (products != null && products.contains("remove_ads")) {
                        hasRemoveAds = true;
                        acknowledgePurchaseIfNeeded(purchase);
                    }
                }
            }

            if (pendingPurchaseCall != null) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("isAdFree", hasRemoveAds);
                ret.put("message", "Satın alma başarıyla tamamlandı!");
                pendingPurchaseCall.resolve(ret);
                pendingPurchaseCall = null;
            }

            // Webview'e event gönder
            JSObject eventData = new JSObject();
            eventData.put("isAdFree", hasRemoveAds);
            notifyListeners("onPurchaseCompleted", eventData, true);

        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            if (pendingPurchaseCall != null) {
                pendingPurchaseCall.reject("Satın alma kullanıcı tarafından iptal edildi.");
                pendingPurchaseCall = null;
            }
        } else {
            if (pendingPurchaseCall != null) {
                pendingPurchaseCall.reject("Satın alma sırasında hata oluştu (" + billingResult.getResponseCode() + "): " + billingResult.getDebugMessage());
                pendingPurchaseCall = null;
            }
        }
    }

    private void acknowledgePurchaseIfNeeded(Purchase purchase) {
        if (purchase != null && !purchase.isAcknowledged() && billingClient != null) {
            AcknowledgePurchaseParams acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.getPurchaseToken())
                .build();
            billingClient.acknowledgePurchase(acknowledgePurchaseParams, billingResult -> {
                Log.d(TAG, "Acknowledge result code: " + billingResult.getResponseCode());
            });
        }
    }
}

import UIKit
import Capacitor
import AVFoundation
import StoreKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Ses efektlerinin ve kelime telaffuzunun sessiz modda da düzgün çalması için
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Audio session setup failed: \(error)")
        }
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

// MARK: - Native App Store Billing Plugin (StoreKit 2)
@objc(AppStoreBillingPlugin)
public class AppStoreBillingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppStoreBillingPlugin"
    public let jsName = "AppStoreBilling"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryPurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getProductDetails", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise)
    ]

    @objc func purchase(_ call: CAPPluginCall) {
        let productId = call.getString("productId") ?? "remove_ads"

        if #available(iOS 15.0, *) {
            Task {
                do {
                    let products = try await Product.products(for: [productId])
                    guard let product = products.first else {
                        call.reject("Ürün App Store üzerinde bulunamadı (ID: \(productId)).")
                        return
                    }

                    let purchaseResult = try await product.purchase()
                    switch purchaseResult {
                    case .success(let verification):
                        switch verification {
                        case .verified(let transaction):
                            await transaction.finish()
                            call.resolve([
                                "success": true,
                                "isAdFree": true,
                                "productId": transaction.productID
                            ])
                        case .unverified(_, let error):
                            call.reject("Satın alma işlemi doğrulanamadı: \(error.localizedDescription)")
                        }
                    case .userCancelled:
                        call.reject("Satın alma işlemi kullanıcı tarafından iptal edildi.", "CANCELLED")
                    case .pending:
                        call.resolve([
                            "pending": true,
                            "isAdFree": false,
                            "message": "Satın alma onay bekliyor."
                        ])
                    @unknown default:
                        call.reject("Bilinmeyen bir satın alma sonucu oluştu.")
                    }
                } catch {
                    call.reject("App Store satın alma işlemi gerçekleştirilemedi: \(error.localizedDescription)")
                }
            }
        } else {
            call.reject("Bu cihaz sürümü App Store In-App Purchase desteklemiyor (iOS 15+ gereklidir).")
        }
    }

    @objc func queryPurchases(_ call: CAPPluginCall) {
        checkEntitlements(call: call)
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            Task {
                try? await AppStore.sync()
                self.checkEntitlements(call: call)
            }
        } else {
            self.checkEntitlements(call: call)
        }
    }

    private func checkEntitlements(call: CAPPluginCall) {
        let productId = call.getString("productId") ?? "remove_ads"

        if #available(iOS 15.0, *) {
            Task {
                var hasPurchased = false
                for await result in Transaction.currentEntitlements {
                    if case .verified(let transaction) = result {
                        if transaction.productID == productId && transaction.revocationDate == nil {
                            hasPurchased = true
                            break
                        }
                    }
                }
                call.resolve([
                    "hasPurchased": hasPurchased,
                    "isAdFree": hasPurchased
                ])
            }
        } else {
            call.resolve([
                "hasPurchased": false,
                "isAdFree": false
            ])
        }
    }

    @objc func getProductDetails(_ call: CAPPluginCall) {
        let productId = call.getString("productId") ?? "remove_ads"

        if #available(iOS 15.0, *) {
            Task {
                do {
                    let products = try await Product.products(for: [productId])
                    if let product = products.first {
                        call.resolve([
                            "productId": product.id,
                            "formattedPrice": product.displayPrice,
                            "title": product.displayName,
                            "description": product.description
                        ])
                    } else {
                        call.resolve([
                            "productId": productId,
                            "formattedPrice": "₺23,99"
                        ])
                    }
                } catch {
                    call.resolve([
                        "productId": productId,
                        "formattedPrice": "₺23,99"
                    ])
                }
            }
        } else {
            call.resolve([
                "productId": productId,
                "formattedPrice": "₺23,99"
            ])
        }
    }
}

# -*- coding: utf-8 -*-
"""
Authentic ÖSYM YDS Translation Questions (Questions 37-42) for Years 2018-2024.
Questions 37-39: English -> Turkish Translation (Soru İngilizce, Şıklar Türkçe)
Questions 40-42: Turkish -> English Translation (Soru Türkçe, Şıklar İngilizce)
"""

def get_authentic_translations_for_year(year):
    if year == 2024:
        return [
            (
                37, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Cognitive behavioral therapy has emerged as one of the most effective psychological interventions for treating chronic anxiety disorders.",
                {
                    "A": "Bilişsel davranışçı terapi, kronik kaygı bozukluklarının tedavisinde en etkili psikolojik müdahalelerden biri olarak ortaya çıkmıştır.",
                    "B": "Kronik kaygı bozukluklarını tedavi etmek için kullanılan psikolojik müdahaleler arasında en yaygını bilişsel davranışçı terapidir.",
                    "C": "Bilişsel davranışçı terapi sayesinde kronik kaygı bozuklukları en etkili psikolojik yöntemlerle tedavi edilmektedir.",
                    "D": "En etkili psikolojik müdahalelerden biri olan bilişsel davranışçı terapi, özellikle kronik kaygı bozukluklarında tercih edilir.",
                    "E": "Kronik kaygı bozukluklarının tedavisinde bilişsel davranışçı terapi kadar etkili başka bir psikolojik müdahale ortaya çıkmamıştır."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: 1. Özneyi bulun: 'Cognitive behavioral therapy' (Bilişsel davranışçı terapi). 2. Ana yüklemi bulun: 'has emerged as...' (...olarak ortaya çıkmıştır). Bu özne ve yüklem eşleşmesi eksiksiz olarak yalnızca A şıkkında mevcuttur.",
                "Cümle Çevirisi: 'Bilişsel davranışçı terapi, kronik kaygı bozukluklarının tedavisinde en etkili psikolojik müdahalelerden biri olarak ortaya çıkmıştır.' B şıkkında yüklem 'en yaygınıdır', C'de 'tedavi edilmektedir', D'de 'tercih edilir' şeklinde değiştirilerek çeldirici yapılmıştır.",
                {"intervention": "müdahale", "anxiety": "kaygı, endişe", "emerge": "ortaya çıkmak", "chronic": "kronik, süreğen"},
                ["translation", "en-tr", "psychology", "health"]
            ),
            (
                38, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Recent archaeological excavations in Southeastern Anatolia prove that hunter-gatherer societies were capable of monumental architecture much earlier than previously assumed.",
                {
                    "A": "Güneydoğu Anadolu'daki son arkeolojik kazılar, avcı-toplayıcı toplumların anıtsal mimariyi daha önce varsayılandan çok daha önce yapabildiğini kanıtlamaktadır.",
                    "B": "Avcı-toplayıcı toplumların anıtsal mimarideki başarısı, Güneydoğu Anadolu'da gerçekleştirilen arkeolojik kazılarla varsayılandan erken kanıtlanmıştır.",
                    "C": "Daha önce varsayılanın aksine, Güneydoğu Anadolu'da yapılan son kazılar avcı-toplayıcıların anıtsal mimari geliştirdiğini gösterir.",
                    "D": "Güneydoğu Anadolu'daki arkeolojik kazılar sayesinde avcı-toplayıcıların mimari yapılar inşa ettiği daha erken anlaşılmıştır.",
                    "E": "Avcı-toplayıcı toplumların mimari yetenekleri, Güneydoğu Anadolu'da yapılan son kazılarla ancak yakın zamanda kanıtlanabilmiştir."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Recent archaeological excavations in Southeastern Anatolia' (Güneydoğu Anadolu'daki son arkeolojik kazılar). Yüklem: 'prove that...' (...-i kanıtlamaktadır). Yüklemin geniş zaman/şimdiki zaman karşılığı olan 'kanıtlamaktadır' doğrudan A şıkkında bulunmaktadır.",
                "Cümle Çevirisi: 'Güneydoğu Anadolu'daki son arkeolojik kazılar, avcı-toplayıcı toplumların anıtsal mimariyi daha önce varsayılandan çok daha önce yapabildiğini kanıtlamaktadır.'",
                {"excavation": "arkeolojik kazı", "monumental": "anıtsal", "hunter-gatherer": "avcı-toplayıcı", "prove": "kanıtlamak"},
                ["translation", "en-tr", "archaeology", "history"]
            ),
            (
                39, "Çeviri", "İngilizce -> Türkçe", "Zor",
                "Cultivating wild apple species without synthetic fertilizers not only preserves beneficial soil bacteria but also enhances the fruit's natural antioxidant concentration.",
                {
                    "A": "Yabani elma türlerini sentetik gübreler olmadan yetiştirmek, sadece yararlı toprak bakterilerini korumakla kalmaz, aynı zamanda meyvenin doğal antioksidan yoğunluğunu da artırır.",
                    "B": "Sentetik gübre kullanmadan yabani elma yetiştirildiğinde toprak bakterileri korunurken meyvenin antioksidan oranı da artmaktadır.",
                    "C": "Yararlı toprak bakterilerini korumak ve antioksidan miktarını artırmak için yabani elma türleri sentetik gübresiz yetiştirilmelidir.",
                    "D": "Yabani elma üretiminde sentetik gübre kullanılmaması hem topraktaki bakterileri korumakta hem de meyveye antioksidan kazandırmaktadır.",
                    "E": "Meyvenin doğal antioksidan miktarını artırmanın yanı sıra toprak bakterilerini de korumak için yabani elmalar sentetik gübresiz yetiştirilir."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: 'not only ... but also ...' kalıbının Türkçe karşılığı 'sadece ... ile kalmaz, aynı zamanda ... de' yapısıdır. Bu ikili bağlacı birebir veren seçenek A'dır.",
                "Cümle Çevirisi: 'Yabani elma türlerini sentetik gübreler olmadan yetiştirmek, sadece yararlı toprak bakterilerini korumakla kalmaz, aynı zamanda meyvenin doğal antioksidan yoğunluğunu da artırır.'",
                {"cultivate": "yetiştirmek", "apple": "elma", "fertilizer": "gübre", "antioxidant": "antioksidan", "preserve": "korumak"},
                ["apple", "translation", "en-tr", "agriculture", "botany"]
            ),
            (
                40, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Yapay zeka sistemleri tıp alanında teşhis doğruluğunu artırsa da hiçbir algoritma uzman bir hekimin klinik deneyiminin yerini tamamen alamaz.",
                {
                    "A": "Although artificial intelligence systems enhance diagnostic accuracy in medicine, no algorithm can completely replace the clinical experience of an expert physician.",
                    "B": "Even if artificial intelligence improves diagnosis in the medical field, algorithms cannot be compared to the clinical knowledge of experienced doctors.",
                    "C": "Artificial intelligence algorithms increase diagnostic precision in medicine, but expert physicians always provide superior clinical experience.",
                    "D": "While artificial intelligence enhances medical diagnosis, expert physicians rarely rely solely on diagnostic algorithms.",
                    "E": "Because artificial intelligence improves diagnostic success in medicine, algorithms will soon assist expert physicians in clinical evaluations."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Türkçe cümledeki '-sa da / -e rağmen' zıtlığı 'Although' ile başlar. Ana cümlenin yüklemi 'yerini tamamen alamaz' -> 'no algorithm can completely replace...'. Birebir A şıkkında mevcuttur.",
                "Cümle Çevirisi: 'Although artificial intelligence systems enhance diagnostic accuracy in medicine, no algorithm can completely replace the clinical experience of an expert physician.'",
                {"diagnostic": "teşhise ait", "accuracy": "doğruluk", "physician": "hekim, doktor", "replace": "yerini almak"},
                ["translation", "tr-en", "technology", "medicine"]
            ),
            (
                41, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Temiz içme suyuna erişim temel bir insan hakkıdır; bu nedenle hükümetler su kaynaklarını kirlilikten korumak için sıkı politikalar uygulamalıdır.",
                {
                    "A": "Access to clean drinking water is a fundamental human right; therefore, governments must implement strict policies to protect water resources from pollution.",
                    "B": "Because clean drinking water is considered a human right, governments are encouraged to protect natural water reserves against contamination.",
                    "C": "Since clean drinking water is an essential right, strict governmental policies should be adopted to eliminate all water pollutants.",
                    "D": "Clean drinking water represents a vital human right; however, many governments struggle to enforce strict regulations on pollution.",
                    "E": "Water resources must be protected from pollution by governments so that all citizens can enjoy their fundamental right to clean water."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Noktalı virgülden sonra gelen 'bu nedenle' ifadesi 'therefore' ile karşılanır. 'temel bir insan hakkıdır' -> 'is a fundamental human right'. 'sıkı politikalar uygulamalıdır' -> 'must implement strict policies'. A şıkkı eksiksizdir.",
                "Cümle Çevirisi: 'Access to clean drinking water is a fundamental human right; therefore, governments must implement strict policies to protect water resources from pollution.'",
                {"fundamental": "temel, asli", "therefore": "bu nedenle", "implement": "uygulamak", "pollution": "kirlilik"},
                ["translation", "tr-en", "environment", "society"]
            ),
            (
                42, "Çeviri", "Türkçe -> İngilizce", "Zor",
                "Geleneksel meyve bahçelerinde kimyasal böcek ilaçlarının kullanımını sınırlandırmak, hem toprak kalitesini artırır hem de yerel ekosistemi korur.",
                {
                    "A": "Restricting the use of chemical pesticides in traditional orchards both enhances soil quality and protects the local ecosystem.",
                    "B": "If farmers limit chemical pesticides in traditional orchards, soil quality and local ecosystems are preserved simultaneously.",
                    "C": "Traditional orchards produce better soil quality when chemical pesticide usage is thoroughly eliminated by growers.",
                    "D": "In order to protect local ecosystems and boost soil nutrients, chemical pesticides should not be applied to traditional orchards.",
                    "E": "Not only the local ecosystem but also soil fertility improves as traditional orchards abandon chemical pesticide sprays."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Özne: 'Geleneksel meyve bahçelerinde kimyasal böcek ilaçlarının kullanımını sınırlandırmak' -> 'Restricting the use of chemical pesticides in traditional orchards'. 'hem ... hem de ...' yapısı -> 'both ... and ...'. A şıkkı kusursuzdur.",
                "Cümle Çevirisi: 'Restricting the use of chemical pesticides in traditional orchards both enhances soil quality and protects the local ecosystem.'",
                {"restrict": "sınırlandırmak", "orchard": "meyve bahçesi", "pesticide": "böcek ilacı", "enhance": "artırmak"},
                ["apple", "translation", "tr-en", "agriculture"]
            )
        ]
    elif year == 2023:
        return [
            (
                37, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Rising global temperatures have accelerated the melting of polar ice caps, threatening coastal communities worldwide with unprecedented sea-level rise.",
                {
                    "A": "Yükselen küresel sıcaklıklar kutup buzullarının erimesini hızlandırarak dünya çapındaki kıyı topluluklarını benzeri görülmemiş deniz seviyesi yükselmesiyle tehdit etmektedir.",
                    "B": "Kutup buzullarının hızla erimesi, yükselen küresel sıcaklıklar nedeniyle kıyı topluluklarında deniz seviyesinin yükselmesine yol açmıştır.",
                    "C": "Dünya çapındaki kıyı toplulukları, küresel sıcaklık artışının kutup buzullarını eritmesi sonucu benzeri görülmemiş tehlikelerle karşılaşmaktadır.",
                    "D": "Kutup buzullarının erimesi hızlandıkça, yükselen küresel sıcaklıklar kıyı bölgelerinde deniz seviyesinin artmasına neden olmaktadır.",
                    "E": "Küresel sıcaklıkların artması kutup buzullarının erimesini tetiklemiş ve kıyı yerleşimlerini benzeri görülmemiş bir tehdit altına sokmuştur."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Rising global temperatures' (Yükselen küresel sıcaklıklar). Fiil 1: 'have accelerated the melting of polar ice caps' (kutup buzullarının erimesini hızlandırarak - zarf fiil). Ana Yüklem: 'threatening coastal communities ...' (kıyı topluluklarını ... tehdit etmektedir). A şıkkı tam ve eksiksizdir.",
                "Cümle Çevirisi: 'Yükselen küresel sıcaklıklar kutup buzullarının erimesini hızlandırarak dünya çapındaki kıyı topluluklarını benzeri görülmemiş deniz seviyesi yükselmesiyle tehdit etmektedir.'",
                {"accelerate": "hızlandırmak", "polar": "kutupsal", "unprecedented": "benzeri görülmemiş", "coastal": "kıyıya ait"},
                ["translation", "en-tr", "climate", "environment"]
            ),
            (
                38, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Despite rigorous international agreements, biodiversity loss continues at an alarming pace, particularly in tropical rainforests.",
                {
                    "A": "Sıkı uluslararası anlaşmalara rağmen, biyoçeşitlilik kaybı özellikle tropikal yağmur ormanlarında endişe verici bir hızla devam etmektedir.",
                    "B": "Tropikal yağmur ormanlarındaki biyoçeşitlilik kaybı, uluslararası anlaşmaların yetersiz kalması sebebiyle hızla sürmektedir.",
                    "C": "Uluslararası alanda yapılan sıkı anlaşmalar, tropikal yağmur ormanlarındaki biyoçeşitlilik kaybının endişe verici hızını yavaşlatamamıştır.",
                    "D": "Biyoçeşitlilik kaybının tropikal ormanlarda endişe verici boyuta ulaşması, uluslararası anlaşmaların sıkılaştırılmasına yol açmıştır.",
                    "E": "Özellikle tropikal yağmur ormanlarında görülen biyoçeşitlilik kaybı, uluslararası anlaşmalara rağmen durdurulamayan bir süreçtir."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Cümle başındaki 'Despite rigorous international agreements' (Sıkı uluslararası anlaşmalara rağmen) zıtlık edatıdır. Özne 'biodiversity loss' (biyoçeşitlilik kaybı), yüklem 'continues at an alarming pace' (endişe verici bir hızla devam etmektedir). A şıkkı birebirdir.",
                "Cümle Çevirisi: 'Sıkı uluslararası anlaşmalara rağmen, biyoçeşitlilik kaybı özellikle tropikal yağmur ormanlarında endişe verici bir hızla devam etmektedir.'",
                {"rigorous": "sıkı, titiz", "biodiversity": "biyoçeşitlilik", "alarming": "endişe verici, korkutucu", "rainforest": "yağmur ormanı"},
                ["translation", "en-tr", "ecology", "biodiversity"]
            ),
            (
                39, "Çeviri", "İngilizce -> Türkçe", "Zor",
                "Epidemiologists emphasize that investing in early warning surveillance systems is far more economical than dealing with the devastating aftermath of global pandemics.",
                {
                    "A": "Epidemiyologlar, erken uyarı gözetim sistemlerine yatırım yapmanın küresel pandemilerin yıkıcı sonuçlarıyla mücadele etmekten çok daha ekonomik olduğunu vurgulamaktadır.",
                    "B": "Küresel pandemilerin yıkıcı etkileriyle başa çıkmak yerine erken uyarı sistemlerine bütçe ayırmak epidemiyologlara göre daha ekonomiktir.",
                    "C": "Epidemiyologların vurguladığı gibi, erken uyarı sistemlerine yatırım yapılmazsa pandemilerin yıkıcı sonuçları çok daha maliyetli olacaktır.",
                    "D": "Pandemilerin ardından ortaya çıkan yıkıcı sonuçlarla mücadele etmektense erken uyarı sistemlerine yatırım yapılması epidemiyologlarca tavsiye edilir.",
                    "E": "Erken uyarı sistemleri kurmanın ekonomik bir yöntem olduğunu belirten epidemiyologlar, küresel pandemilerin yıkıcı etkilerine dikkat çekmektedir."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Epidemiologists' (Epidemiyologlar). Yüklem: 'emphasize that...' (...vurgulamaktadır). Karşılaştırma: 'is far more economical than...' (...-den çok daha ekonomiktir). A şıkkı bu yapıyı eksiksiz korur.",
                "Cümle Çevirisi: 'Epidemiyologlar, erken uyarı gözetim sistemlerine yatırım yapmanın küresel pandemilerin yıkıcı sonuçlarıyla mücadele etmekten çok daha ekonomik olduğunu vurgulamaktadır.'",
                {"surveillance": "gözetim, izleme", "economical": "ekonomik, tasarruflu", "devastating": "yıkıcı", "aftermath": "sonrası, neticesi"},
                ["translation", "en-tr", "health", "epidemiology"]
            ),
            (
                40, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Sürdürülebilir kalkınma hedeflerine ulaşmak için gelişmekte olan ülkelerin yeşil teknoloji projelerine daha fazla uluslararası finansman sağlanmalıdır.",
                {
                    "A": "In order to achieve sustainable development goals, more international financing should be provided for green technology projects in developing countries.",
                    "B": "Because developing countries aim to reach sustainable development goals, international funds are allocated to green technology.",
                    "C": "Developing countries should invest more international funds in green technologies so that sustainable development goals can be achieved.",
                    "D": "To attain sustainable development targets, green technology projects in developing nations must receive substantial local investments.",
                    "E": "Sustainable development goals require developing countries to finance their own green technology initiatives through international partnerships."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: 'ulaşmak için' amaç ifadesi 'In order to achieve' veya 'To achieve' ile başlar. Yüklem: 'sağlanmalıdır' (edilgen / passive modali: 'should be provided'). A seçeneğinde hem amaç cümlesi hem de edilgen modal yüklem tam olarak bulunmaktadır.",
                "Cümle Çevirisi: 'In order to achieve sustainable development goals, more international financing should be provided for green technology projects in developing countries.'",
                {"sustainable": "sürdürülebilir", "development": "kalkınma, gelişme", "financing": "finansman, fon sağlama", "developing": "gelişmekte olan"},
                ["translation", "tr-en", "development", "economy"]
            ),
            (
                41, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Aşı tereddüdü, sadece bireysel sağlığı tehlikeye atmakla kalmaz, aynı zamanda toplum genelinde sürü bağışıklığının oluşmasını da engeller.",
                {
                    "A": "Vaccine hesitancy not only jeopardizes individual health but also prevents the development of herd immunity across society.",
                    "B": "Because vaccine hesitancy threatens personal health, achieving herd immunity in the community becomes extremely difficult.",
                    "C": "Vaccine hesitancy poses a risk to individual well-being while delaying the establishment of herd immunity in society.",
                    "D": "If individuals hesitate to get vaccinated, both their own health and the community's collective immunity are compromised.",
                    "E": "Not only does herd immunity protect society, but individual vaccination also prevents serious public health crises."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: 'sadece ... ile kalmaz, aynı zamanda ... de' yapısı doğrudan 'not only ... but also ...' ikili bağlacıyla aktarılır. Özne: 'Vaccine hesitancy' (Aşı tereddüdü). Yüklem 1: 'jeopardizes' (tehlikeye atar), Yüklem 2: 'prevents' (engeller). A şıkkı tam ve eksiksizdir.",
                "Cümle Çevirisi: 'Vaccine hesitancy not only jeopardizes individual health but also prevents the development of herd immunity across society.'",
                {"hesitancy": "tereddüt, çekinme", "jeopardize": "tehlikeye atmak", "herd immunity": "sürü bağışıklığı", "prevent": "engellemek"},
                ["translation", "tr-en", "medicine", "health"]
            ),
            (
                42, "Çeviri", "Türkçe -> İngilizce", "Zor",
                "Şehir planlamacıları kentsel yeşil alanları artırdıkça, hava kirliliği seviyeleri belirgin şekilde düşmekte ve halkın yaşam kalitesi yükselmektedir.",
                {
                    "A": "As urban planners increase urban green spaces, air pollution levels decline noticeably and the public's quality of life improves.",
                    "B": "When urban green spaces are expanded by city planners, air pollution drops and public health standards rise.",
                    "C": "Since urban planners prioritize green areas in cities, air pollution is minimized and the quality of urban life is enhanced.",
                    "D": "Although city planners strive to increase green zones, air pollution levels rarely decrease without improving the public's lifestyle.",
                    "E": "Because urban planners create more parks and green spaces, noticeable improvements in air quality raise living standards."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: '-dıkça / -dikçe' orantısal zaman bağlacı 'As' ile karşılanır ('As urban planners increase...'). Yüklemler: 'düşmekte' (decline noticeably) ve 'yükselmektedir' (improves). A şıkkı tüm nüansları eksiksiz taşır.",
                "Cümle Çevirisi: 'As urban planners increase urban green spaces, air pollution levels decline noticeably and the public's quality of life improves.'",
                {"urban planner": "şehir planlamacısı", "decline": "düşmek, azalmak", "noticeably": "belirgin şekilde", "quality of life": "yaşam kalitesi"},
                ["translation", "tr-en", "urban", "environment"]
            )
        ]
    elif year == 2022:
        return [
            (
                37, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Solar and wind power have become the fastest-growing energy sources globally due to dramatic reductions in manufacturing costs over the last decade.",
                {
                    "A": "Güneş ve rüzgâr enerjisi, son on yılda üretim maliyetlerindeki çarpıcı düşüşler sayesinde küresel ölçekte en hızlı büyüyen enerji kaynakları haline gelmiştir.",
                    "B": "Son on yılda üretim maliyetlerinin azalması, güneş ve rüzgâr enerjisini dünyadaki en popüler enerji türü yapmıştır.",
                    "C": "Güneş ve rüzgâr enerjisinde görülen hızlı büyüme, üretim maliyetlerinin son on yıl boyunca sürekli düşmesinden kaynaklanmaktadır.",
                    "D": "Üretim maliyetleri dramatik biçimde azaldığı için güneş ve rüzgâr gücü dünyada en çok tercih edilen yenilenebilir enerji kaynağı olmuştur.",
                    "E": "Son on yıl içinde üretim maliyetlerini düşüren güneş ve rüzgâr enerjisi, küresel olarak en hızlı gelişen sektör konumundadır."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Solar and wind power' (Güneş ve rüzgâr enerjisi). Yüklem: 'have become...' (...haline gelmiştir). Neden zarfı: 'due to dramatic reductions in manufacturing costs over the last decade' (son on yılda üretim maliyetlerindeki çarpıcı düşüşler sayesinde/nedeniyle). A seçeneği tam eşleşir.",
                "Cümle Çevirisi: 'Güneş ve rüzgâr enerjisi, son on yılda üretim maliyetlerindeki çarpıcı düşüşler sayesinde küresel ölçekte en hızlı büyüyen enerji kaynakları haline gelmiştir.'",
                {"dramatic": "çarpıcı, dramatik", "reduction": "düşüş, azalma", "manufacturing": "üretim, imalat", "source": "kaynak"},
                ["translation", "en-tr", "energy", "environment"]
            ),
            (
                38, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Although organic farming yields lower crop volumes per hectare than conventional agriculture, it significantly improves soil fertility over time.",
                {
                    "A": "Organik tarım, hektar başına geleneksel tarımdan daha düşük ürün miktarı sağlasa da zamanla toprak verimliliğini önemli ölçüde artırır.",
                    "B": "Geleneksel tarıma kıyasla hektar başına daha az ürün veren organik tarım, toprağın verimli kalmasını garanti altına almaktadır.",
                    "C": "Organik tarımın hektar başına ürün verimi düşük olmasına rağmen, geleneksel tarımdan daha verimli topraklar oluşturduğu bilinmektedir.",
                    "D": "Zaman içinde toprak verimliliğini belirgin biçimde artıran organik tarım, ne yazık ki hektar başına daha düşük hasat vermektedir.",
                    "E": "Organik tarım toprak verimliliğini zamanla artırsa bile, geleneksel tarımın sunduğu yüksek rekolteye ulaşması zordur."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: 'Although ...' zıtlık yapısı '-sa da / -e rağmen' şeklinde aktarılır. 'yields lower crop volumes per hectare' (hektar başına daha düşük ürün miktarı sağlasa da). Ana yüklem: 'significantly improves soil fertility over time' (zamanla toprak verimliliğini önemli ölçüde artırır). A şıkkı kusursuzdur.",
                "Cümle Çevirisi: 'Organik tarım, hektar başına geleneksel tarımdan daha düşük ürün miktarı sağlasa da zamanla toprak verimliliğini önemli ölçüde artırır.'",
                {"yield": "ürün vermek, sağlamak", "fertility": "verimlilik, doğurganlık", "conventional": "geleneksel, alışılagelmiş"},
                ["translation", "en-tr", "agriculture", "soil"]
            ),
            (
                39, "Çeviri", "İngilizce -> Türkçe", "Zor",
                "Hydroelectric reservoirs can generate substantial clean electricity, but they often disrupt freshwater ecosystems and displace local communities.",
                {
                    "A": "Hidroelektrik baraj gölleri önemli miktarda temiz elektrik üretebilir, ancak genellikle tatlı su ekosistemlerini bozar ve yerel toplulukları yerinden eder.",
                    "B": "Önemli ölçüde temiz elektrik üretmelerine rağmen hidroelektrik rezervuarları, tatlı su ekosistemlerine ve yerel halka zarar vermektedir.",
                    "C": "Tatlı su ekosistemlerini bozan ve yerel halkı göçe zorlayan hidroelektrik santralleri, yine de temiz enerji üretiminde etkilidir.",
                    "D": "Hidroelektrik barajlar temiz elektrik üretiminde önemli rol oynasa da tatlı su canlılarını yok ederek yerel halkı mağdur etmektedir.",
                    "E": "Temiz elektrik üretimi sağlamak amacıyla kurulan hidroelektrik baraj gölleri, çoğu zaman tatlı su kaynaklarını tahrip eder."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: 'can generate substantial clean electricity' (önemli miktarda temiz elektrik üretebilir), 'but they often disrupt ... and displace ...' (ancak genellikle tatlı su ekosistemlerini bozar ve yerel toplulukları yerinden eder). A şıkkı özne, yüklem ve bağlaç uyumunu eksiksiz yansıtır.",
                "Cümle Çevirisi: 'Hidroelektrik baraj gölleri önemli miktarda temiz elektrik üretebilir, ancak genellikle tatlı su ekosistemlerini bozar ve yerel toplulukları yerinden eder.'",
                {"reservoir": "baraj gölü, rezervuar", "substantial": "önemli miktarda, hatırı sayılır", "disrupt": "aksatmak, bozmak", "displace": "yerinden etmek"},
                ["translation", "en-tr", "energy", "ecology"]
            ),
            (
                40, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Fosil yakıt tüketimini azaltmak, yalnızca sera gazı emisyonlarını düşürmez, aynı zamanda kentsel alanlarda hava kalitesini de iyileştirir.",
                {
                    "A": "Reducing fossil fuel consumption not only lowers greenhouse gas emissions but also improves air quality in urban areas.",
                    "B": "Because fossil fuel consumption is reduced, greenhouse gas emissions drop and urban air quality improves.",
                    "C": "If we reduce the consumption of fossil fuels, both greenhouse gas emissions and urban air pollution will decrease.",
                    "D": "To improve air quality in urban areas, reducing fossil fuel consumption is more effective than limiting greenhouse gases.",
                    "E": "Not only greenhouse gas emissions but also urban air pollutants decline when fossil fuel use is abandoned."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: 'yalnızca ... ile kalmaz, aynı zamanda ... de' yapısı 'not only ... but also ...' ile verilir. Özne gerund olmalıdır: 'Reducing fossil fuel consumption' (Fosil yakıt tüketimini azaltmak). A şıkkı eksiksiz karşılıktır.",
                "Cümle Çevirisi: 'Reducing fossil fuel consumption not only lowers greenhouse gas emissions but also improves air quality in urban areas.'",
                {"consumption": "tüketim", "greenhouse gas": "sera gazı", "emission": "salım, emisyon", "urban": "kentsel"},
                ["translation", "tr-en", "energy", "climate"]
            ),
            (
                41, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Geri dönüşüm programları başarılı olmak istiyorsa, yerel yönetimler halkı atık ayrıştırma konusunda kapsamlı bir şekilde eğitmelidir.",
                {
                    "A": "If recycling programs are to be successful, local governments must educate the public comprehensively on waste sorting.",
                    "B": "Because recycling programs depend on success, local authorities should inform citizens about waste management.",
                    "C": "When local governments provide comprehensive training on waste separation, recycling programs succeed automatically.",
                    "D": "Recycling initiatives can only achieve success if municipalities encourage citizens to sort their daily garbage.",
                    "E": "In order for recycling programs to expand, public awareness campaigns on waste collection must be initiated."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: 'başarılı olmak istiyorsa / başarılı olacaksa' hedef koşul yapısı İngilizcede 'If ... are to be successful' şeklinde ifade edilir. Yüklem: 'kapsamlı bir şekilde eğitmelidir' -> 'must educate the public comprehensively'. A şıkkı tam ve doğrudur.",
                "Cümle Çevirisi: 'If recycling programs are to be successful, local governments must educate the public comprehensively on waste sorting.'",
                {"comprehensively": "kapsamlı bir şekilde", "waste sorting": "atık ayrıştırma", "local government": "yerel yönetim"},
                ["translation", "tr-en", "environment", "public"]
            ),
            (
                42, "Çeviri", "Türkçe -> İngilizce", "Zor",
                "Jeotermal enerji santralleri, hava koşullarından bağımsız olarak kesintisiz elektrik sağlayabildikleri için güvenilir bir yenilenebilir enerji kaynağıdır.",
                {
                    "A": "Geothermal power plants are a reliable renewable energy source because they can provide uninterrupted electricity regardless of weather conditions.",
                    "B": "Since geothermal power plants produce electricity continuously, they are considered dependable despite changing climate patterns.",
                    "C": "Because weather conditions do not affect geothermal plants, uninterrupted renewable electricity can be generated easily.",
                    "D": "Geothermal power represents a consistent energy alternative so long as weather conditions do not disrupt electricity transmission.",
                    "E": "Renewable energy from geothermal sources remains dependable even when extreme weather conditions threaten regular electricity supplies."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Özne: 'Geothermal power plants' (Jeotermal enerji santralleri). Ana yargı: 'are a reliable renewable energy source' (güvenilir bir yenilenebilir enerji kaynağıdır). Neden: 'because they can provide uninterrupted electricity regardless of weather conditions' (...hava koşullarından bağımsız olarak kesintisiz elektrik sağlayabildikleri için). A şıkkı tamdır.",
                "Cümle Çevirisi: 'Geothermal power plants are a reliable renewable energy source because they can provide uninterrupted electricity regardless of weather conditions.'",
                {"geothermal": "jeotermal", "uninterrupted": "kesintisiz", "regardless of": "-e bakılmaksızın, -den bağımsız olarak", "reliable": "güvenilir"},
                ["translation", "tr-en", "energy", "technology"]
            )
        ]
    elif year == 2021:
        return [
            (
                37, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "The discovery of penicillin by Alexander Fleming revolutionized the treatment of bacterial infections and marked the beginning of the modern antibiotic era.",
                {
                    "A": "Penisilinin Alexander Fleming tarafından keşfi, bakteriyel enfeksiyonların tedavisinde devrim yaratmış ve modern antibiyotik çağının başlangıcına işaret etmiştir.",
                    "B": "Alexander Fleming penisilini keşfederek bakteriyel enfeksiyonların tedavisini değiştirmiş ve modern antibiyotik dönemini başlatmıştır.",
                    "C": "Bakteriyel enfeksiyonların tedavisinde devrim yaratan penisilin, Alexander Fleming tarafından keşfedilerek antibiyotik çağını açmıştır.",
                    "D": "Modern antibiyotik çağının başlangıcı, Alexander Fleming'in bakteriyel hastalıkları tedavi eden penisilini bulmasıyla gerçekleşmiştir.",
                    "E": "Penisilin keşfedildikten sonra bakteriyel enfeksiyonların tedavisi kökten değişmiş ve Alexander Fleming sayesinde antibiyotik çağı başlamıştır."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'The discovery of penicillin by Alexander Fleming' (Penisilinin Alexander Fleming tarafından keşfi). Yüklemler: 'revolutionized...' (devrim yaratmış) ve 'marked...' (işaret etmiştir). A seçeneği özne ve yüklemleri birebir karşılar.",
                "Cümle Çevirisi: 'Penisilinin Alexander Fleming tarafından keşfi, bakteriyel enfeksiyonların tedavisinde devrim yaratmış ve modern antibiyotik çağının başlangıcına işaret etmiştir.'",
                {"revolutionize": "devrim yaratmak", "infection": "enfeksiyon, bulaşma", "mark": "işaret etmek, damga vurmak", "era": "çağ, dönem"},
                ["translation", "en-tr", "medicine", "history"]
            ),
            (
                38, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Remote working models adopted during the pandemic have fundamentally transformed corporate communication and employee work-life balance.",
                {
                    "A": "Pandemi sırasında benimsenen uzaktan çalışma modelleri, kurumsal iletişimi ve çalışanların iş-yaşam dengesini kökten dönüştürmüştür.",
                    "B": "Kurumsal iletişim ve çalışanların iş-yaşam dengesi, pandemide ortaya çıkan uzaktan çalışma yöntemleriyle değişime uğramıştır.",
                    "C": "Pandemi sürecinde uzaktan çalışmaya geçen şirketler, hem çalışanların iş-yaşam dengesini hem de kurumsal iletişimi yenilemiştir.",
                    "D": "Uzaktan çalışma modellerinin yaygınlaşması, özellikle pandemi döneminde kurumsal iletişimde köklü dönüşümler yaratmıştır.",
                    "E": "Çalışanların iş-yaşam dengesini iyileştiren uzaktan çalışma modelleri, pandemi sonrasında kurumsal iletişimi temelden etkilemiştir."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Remote working models adopted during the pandemic' (Pandemi sırasında benimsenen uzaktan çalışma modelleri). Yüklem: 'have fundamentally transformed...' (...kökten dönüştürmüştür). A seçeneği tam oturur.",
                "Cümle Çevirisi: 'Pandemi sırasında benimsenen uzaktan çalışma modelleri, kurumsal iletişimi ve çalışanların iş-yaşam dengesini kökten dönüştürmüştür.'",
                {"fundamentally": "kökten, esaslı biçimde", "transform": "dönüştürmek", "corporate": "kurumsal", "adopt": "benimsemek"},
                ["translation", "en-tr", "business", "work"]
            ),
            (
                39, "Çeviri", "İngilizce -> Türkçe", "Zor",
                "Children who are exposed to multiple languages during early development exhibit superior cognitive flexibility compared to their monolingual peers.",
                {
                    "A": "Erken gelişim döneminde birden fazla dile maruz kalan çocuklar, tek dilli akranlarına kıyasla üstün bilişsel esneklik sergilerler.",
                    "B": "Birden fazla dil öğrenerek büyüyen çocukların bilişsel esnekliği, tek dilli akranlarından çok daha üstün olmaktadır.",
                    "C": "Tek dilli akranlarıyla karşılaştırıldığında, erken yaşta yabancı dil öğrenen çocukların zihinsel gelişimi daha esnektir.",
                    "D": "Erken çocuklukta birden çok dili duyan bireyler, tek dil konuşan akranlarına nazaran daha yüksek zihinsel beceriler gösterir.",
                    "E": "Bilişsel esneklik bakımından tek dilli akranlarından üstün olan çocuklar, erken yaşta birden fazla dile maruz kalmış olanlardır."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne sıfat tamlamasıdır: 'Children who are exposed to multiple languages during early development' (Erken gelişim döneminde birden fazla dile maruz kalan çocuklar). Yüklem: 'exhibit superior cognitive flexibility' (üstün bilişsel esneklik sergilerler). Karşılaştırma: 'compared to their monolingual peers' (tek dilli akranlarına kıyasla). A şıkkı tamdır.",
                "Cümle Çevirisi: 'Erken gelişim döneminde birden fazla dile maruz kalan çocuklar, tek dilli akranlarına kıyasla üstün bilişsel esneklik sergilerler.'",
                {"expose": "maruz bırakmak", "flexibility": "esneklik", "monolingual": "tek dilli", "peer": "akran, denk"},
                ["translation", "en-tr", "linguistics", "psychology"]
            ),
            (
                40, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Düzenli fiziksel egzersiz yapmak sadece kalp sağlığını güçlendirmekle kalmaz, aynı zamanda stres seviyelerini de belirgin biçimde azaltır.",
                {
                    "A": "Doing regular physical exercise not only strengthens cardiovascular health but also significantly reduces stress levels.",
                    "B": "Because regular physical workouts improve heart health, stress levels are reduced significantly in individuals.",
                    "C": "If a person exercises regularly, both heart diseases and chronic stress levels will decline over time.",
                    "D": "Regular physical training is recommended to lower stress levels while simultaneously protecting the heart.",
                    "E": "Not only stress levels but also cardiovascular complications decrease through frequent physical workouts."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: 'sadece ... ile kalmaz, aynı zamanda ... de' -> 'not only ... but also ...'. Özne: 'Doing regular physical exercise' (Düzenli fiziksel egzersiz yapmak). Yüklemler: 'strengthens cardiovascular health' (kalp sağlığını güçlendirir) ve 'significantly reduces stress levels' (stres seviyelerini belirgin biçimde azaltır). A şıkkı doğrudur.",
                "Cümle Çevirisi: 'Doing regular physical exercise not only strengthens cardiovascular health but also significantly reduces stress levels.'",
                {"cardiovascular": "kalp ve damara ait", "strengthen": "güçlendirmek", "regular": "düzenli", "reduce": "azaltmak"},
                ["translation", "tr-en", "health", "exercise"]
            ),
            (
                41, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Bilim insanları aşıların güvenliğini doğrulamak amacıyla klinik testleri geniş kitleler üzerinde titizlikle yürütmektedir.",
                {
                    "A": "Scientists conduct clinical trials meticulously on large populations in order to confirm the safety of vaccines.",
                    "B": "Because vaccine safety must be confirmed, scientists meticulously test new formulas on broad groups.",
                    "C": "Clinical trials are conducted on extensive populations so that scientists can guarantee vaccine effectiveness.",
                    "D": "In order to ensure that vaccines are safe, researchers carry out rigorous laboratory experiments on volunteers.",
                    "E": "Scientists have tested vaccines on large communities meticulously, confirming that they cause no adverse reactions."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Özne: 'Scientists' (Bilim insanları). Yüklem: 'conduct clinical trials meticulously...' (...klinik testleri titizlikle yürütmektedir). Amaç: 'in order to confirm the safety of vaccines' (aşıların güvenliğini doğrulamak amacıyla). A şıkkı eksiksizdir.",
                "Cümle Çevirisi: 'Scientists conduct clinical trials meticulously on large populations in order to confirm the safety of vaccines.'",
                {"meticulously": "titizlikle", "clinical trial": "klinik deneme/test", "confirm": "doğrulamak, teyit etmek", "safety": "güvenlik"},
                ["translation", "tr-en", "science", "medicine"]
            ),
            (
                42, "Çeviri", "Türkçe -> İngilizce", "Zor",
                "Teknolojik yenilikler geleneksel iş kollarını ortadan kaldırsa da geleceğin ekonomisinde yepyeni uzmanlık alanları yaratacaktır.",
                {
                    "A": "Although technological innovations eliminate traditional occupations, they will create entirely new fields of expertise in the future economy.",
                    "B": "Even if traditional jobs disappear due to technology, new careers will always emerge in modern industries.",
                    "C": "While technological changes threaten traditional work sectors, novel fields of profession are anticipated in the near future.",
                    "D": "Since technological innovations replace old professions, young workers must develop new skills for future economic demands.",
                    "E": "Traditional occupations may be eliminated by technologies; however, future economic systems will offer alternative expertise."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: '-sa da / -e rağmen' yapısı 'Although' ile karşılanır. 'ortadan kaldırsa da' -> 'Although technological innovations eliminate traditional occupations'. Gelecek zaman ana yüklem: 'they will create entirely new fields of expertise...' (...yepyeni uzmanlık alanları yaratacaktır). A seçeneği tam oturur.",
                "Cümle Çevirisi: 'Although technological innovations eliminate traditional occupations, they will create entirely new fields of expertise in the future economy.'",
                {"innovation": "yenilik, inovasyon", "occupation": "meslek, iş kolu", "expertise": "uzmanlık", "eliminate": "ortadan kaldırmak"},
                ["translation", "tr-en", "technology", "economy"]
            )
        ]
    elif year == 2020:
        return [
            (
                37, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Widespread quarantine measures enforced during epidemic outbreaks can slow disease transmission, but they often inflict severe economic burdens on vulnerable households.",
                {
                    "A": "Salgın dönemlerinde uygulanan yaygın karantina tedbirleri hastalık bulaşmasını yavaşlatabilir, ancak genellikle kırılgan hanelere ağır ekonomik yükler getirir.",
                    "B": "Salgınlarda karantina uygulanması hastalığın yayılmasını önlese de özellikle yoksul ailelerin ekonomik durumunu ciddi şekilde sarsmaktadır.",
                    "C": "Karantina önlemleri sayesinde salgınların yayılma hızı düşürülebilmektedir; fakat bu durum dar gelirli hanelerde ekonomik krize yol açar.",
                    "D": "Hastalık bulaşmasını yavaşlatmak amacıyla alınan sıkı karantina kararları, kırılgan hanelerin ekonomik zorluklar yaşamasına sebep olmuştur.",
                    "E": "Salgın patlak verdiğinde devreye sokulan karantina uygulamaları bulaşmayı azaltsa bile ekonomik açıdan hanelere ağır zararlar verir."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Widespread quarantine measures enforced during epidemic outbreaks' (Salgın dönemlerinde uygulanan yaygın karantina tedbirleri). Yüklem 1: 'can slow disease transmission' (hastalık bulaşmasını yavaşlatabilir). Yüklem 2: 'inflict severe economic burdens...' (ağır ekonomik yükler getirir). A şıkkı tam karşılıktır.",
                "Cümle Çevirisi: 'Salgın dönemlerinde uygulanan yaygın karantina tedbirleri hastalık bulaşmasını yavaşlatabilir, ancak genellikle kırılgan hanelere ağır ekonomik yükler getirir.'",
                {"outbreak": "salgın, patlak verme", "transmission": "bulaşma, aktarım", "inflict": "yol açmak, yüklemek", "vulnerable": "kırılgan, savunmasız"},
                ["translation", "en-tr", "health", "economy"]
            ),
            (
                38, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "The immune system relies on specialized white blood cells to detect and neutralize pathogenic organisms before they can cause severe tissue damage.",
                {
                    "A": "Bağışıklık sistemi, patojenik organizmaları ciddi doku hasarına yol açmadan önce tespit edip etkisiz hale getirmek için özelleşmiş akyuvarlara güvenir.",
                    "B": "Patojenik organizmaların dokularda ciddi hasar oluşturmasını engellemek bağışıklık sistemindeki akyuvarların temel görevidir.",
                    "C": "Özelleşmiş beyaz kan hücreleri, bağışıklık sistemini destekleyerek patojenleri doku hasarı meydana gelmeden önce yok eder.",
                    "D": "Bağışıklık sisteminin patojenleri etkisiz kılabilmesi, doku hasarından önce akyuvarların hızlı hareket etmesine bağlıdır.",
                    "E": "Ciddi doku tahribatına neden olan organizmaları tespit eden akyuvarlar, bağışıklık sisteminin en önemli savunma mekanizmasıdır."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'The immune system' (Bağışıklık sistemi). Yüklem: 'relies on...' (...-e güvenir / dayanır). Amaç: 'to detect and neutralize ... before they can cause severe tissue damage' (patojenik organizmaları ciddi doku hasarına yol açmadan önce tespit edip etkisiz hale getirmek için). A şıkkı tamdır.",
                "Cümle Çevirisi: 'Bağışıklık sistemi, patojenik organizmaları ciddi doku hasarına yol açmadan önce tespit edip etkisiz hale getirmek için özelleşmiş akyuvarlara güvenir.'",
                {"immune system": "bağışıklık sistemi", "neutralize": "etkisiz hale getirmek", "pathogenic": "hastalık yapıcı", "tissue": "doku"},
                ["translation", "en-tr", "biology", "medicine"]
            ),
            (
                39, "Çeviri", "İngilizce -> Türkçe", "Zor",
                "Unless governments allocate sufficient resources to public healthcare infrastructure, recurring epidemics will continue to overwhelm hospital capacities.",
                {
                    "A": "Hükümetler kamu sağlığı altyapısına yeterli kaynak tahsis etmedikçe, tekrarlayan salgınlar hastane kapasitelerini zorlamaya devam edecektir.",
                    "B": "Kamu sağlığı altyapısına hükümetlerce kaynak aktarılmazsa hastaneler salgın dönemlerinde yetersiz kalabilir.",
                    "C": "Hastanelerin kapasitelerinin aşılmaması için kamu sağlık sistemine ayrılan bütçenin hükümetler tarafından artırılması şarttır.",
                    "D": "Hükümetlerin kamu sağlığına yeterli kaynak ayırmaması durumunda, tekrarlayan salgın hastalıklar sağlık sistemini çökertecektir.",
                    "E": "Tekrarlayan salgınların hastaneleri zorlamasını engellemenin tek yolu, hükümetlerin kamu sağlığı yatırımlarını hızlandırmasıdır."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: 'Unless ...' koşul bağlacı '-medikçe / -madıkça' şeklinde çevrilir. 'Unless governments allocate sufficient resources...' (Hükümetler yeterli kaynak tahsis etmedikçe). Ana yüklem: 'will continue to overwhelm...' (...zorlamaya devam edecektir). A şıkkı birebirdir.",
                "Cümle Çevirisi: 'Hükümetler kamu sağlığı altyapısına yeterli kaynak tahsis etmedikçe, tekrarlayan salgınlar hastane kapasitelerini zorlamaya devam edecektir.'",
                {"allocate": "tahsis etmek, ayırmak", "infrastructure": "altyapı", "recurring": "tekrarlayan", "overwhelm": "aşırı yüklenmek, zorlamak"},
                ["translation", "en-tr", "public health", "governance"]
            ),
            (
                40, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Virüsler hızla mutasyona uğrayabildiği için araştırmacılar aşıların etkinliğini düzenli laboratuvar deneyleriyle sürekli izlemelidir.",
                {
                    "A": "Because viruses can mutate rapidly, researchers must continuously monitor the effectiveness of vaccines through regular laboratory experiments.",
                    "B": "Since viruses undergo rapid mutations, vaccine efficacy should be tested periodically in laboratory environments.",
                    "C": "Although viruses mutate very quickly, researchers are able to track vaccine effectiveness with laboratory experiments.",
                    "D": "Researchers continuously evaluate vaccines in laboratories so that rapid viral mutations can be prevented in time.",
                    "E": "Due to the fast mutation of viral strains, regular laboratory trials are required to preserve vaccine potency."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: '-dığı için' neden bağlacı 'Because / Since' ile başlar ('Because viruses can mutate rapidly'). Yüklem: 'sürekli izlemelidir' -> 'must continuously monitor the effectiveness of vaccines...'. A şıkkı tamdır.",
                "Cümle Çevirisi: 'Because viruses can mutate rapidly, researchers must continuously monitor the effectiveness of vaccines through regular laboratory experiments.'",
                {"mutate": "mutasyona uğramak", "monitor": "izlemek, takip etmek", "effectiveness": "etkinlik, etkililik", "rapidly": "hızla"},
                ["translation", "tr-en", "virology", "science"]
            ),
            (
                41, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Maske takmak ve sosyal mesafeyi korumak, bulaşıcı hastalıkların yayılmasını önlemede en etkili bireysel tedbirler arasındadır.",
                {
                    "A": "Wearing masks and maintaining social distance are among the most effective individual measures in preventing the spread of infectious diseases.",
                    "B": "To stop infectious diseases from spreading, individuals should prioritize wearing masks and keeping social distance.",
                    "C": "Maintaining social distancing along with mask wearing represents the primary defense against contagious illnesses.",
                    "D": "Because masks and social distancing prevent infections, they are considered essential personal precautions.",
                    "E": "Among individual measures to avoid infectious illnesses, wearing protective masks and social distancing come first."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Özne: 'Wearing masks and maintaining social distance' (Maske takmak ve sosyal mesafeyi korumak). Yüklem: 'are among the most effective individual measures...' (...en etkili bireysel tedbirler arasındadır). A seçeneği eksiksiz karşılar.",
                "Cümle Çevirisi: 'Wearing masks and maintaining social distance are among the most effective individual measures in preventing the spread of infectious diseases.'",
                {"infectious": "bulaşıcı", "measure": "tedbir, önlem", "maintain": "sürdürmek, korumak", "spread": "yayılma"},
                ["translation", "tr-en", "health", "society"]
            ),
            (
                42, "Çeviri", "Türkçe -> İngilizce", "Zor",
                "Küresel tedarik zincirlerindeki aksamalar sadece sanayi üretimini yavaşlatmakla kalmamış, temel gıda fiyatlarının da keskin bir şekilde artmasına neden olmuştur.",
                {
                    "A": "Disruptions in global supply chains not only slowed industrial production but also caused basic food prices to rise sharply.",
                    "B": "Because global supply chains broke down, industrial output fell and food prices increased dramatically worldwide.",
                    "C": "Global supply chain disruptions affected industrial manufacturing while leading to sharp increases in essential food costs.",
                    "D": "When international supply networks were disrupted, both manufacturing industries and food commodity markets suffered.",
                    "E": "Not only basic food commodities but also industrial manufacturing experienced difficulties due to supply chain problems."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: 'sadece ... ile kalmamış, aynı zamanda ... neden olmuştur' -> 'not only slowed ... but also caused ... to rise sharply'. Özne: 'Disruptions in global supply chains' (Küresel tedarik zincirlerindeki aksamalar). A şıkkı kusursuzdur.",
                "Cümle Çevirisi: 'Disruptions in global supply chains not only slowed industrial production but also caused basic food prices to rise sharply.'",
                {"supply chain": "tedarik zinciri", "disruption": "aksama, bozulma", "sharply": "keskin bir biçimde", "industrial": "sanayiye ait"},
                ["translation", "tr-en", "economy", "logistics"]
            )
        ]
    elif year == 2019:
        return [
            (
                37, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Data collected by space telescopes has enabled astrophysicists to detect thousands of exoplanets orbiting distant stars in our galaxy.",
                {
                    "A": "Uzay teleskopları tarafından toplanan veriler, astrofizikçilerin galaksimizdeki uzak yıldızların etrafında dönen binlerce ötegezegeni tespit etmesini sağlamıştır.",
                    "B": "Astrofizikçiler uzay teleskoplarından elde ettikleri veriler sayesinde galaksimizdeki binlerce yıldız ve ötegezegeni keşfetmiştir.",
                    "C": "Galaksimizdeki uzak yıldızların çevresinde dönen binlerce gezegen, uzay teleskoplarının topladığı bilgilerle araştırılmaktadır.",
                    "D": "Uzay teleskopları veri topladıkça, astrofizikçiler galaksideki uzak yıldız sistemlerinde yeni ötegezegenler keşfetmektedir.",
                    "E": "Galaksimizde bulunan binlerce ötegezegenin tespiti, astrofizikçilerin uzay teleskoplarını etkin kullanmasıyla mümkün olmuştur."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Data collected by space telescopes' (Uzay teleskopları tarafından toplanan veriler). Yüklem: 'has enabled astrophysicists to detect...' (...astrofizikçilerin tespit etmesini sağlamıştır). Nesne: 'thousands of exoplanets orbiting distant stars in our galaxy' (galaksimizdeki uzak yıldızların etrafında dönen binlerce ötegezegeni). A şıkkı tam oturur.",
                "Cümle Çevirisi: 'Uzay teleskopları tarafından toplanan veriler, astrofizikçilerin galaksimizdeki uzak yıldızların etrafında dönen binlerce ötegezegeni tespit etmesini sağlamıştır.'",
                {"telescope": "teleskop", "astrophysicist": "astrofizikçi", "exoplanet": "ötegezegen", "orbit": "yörüngesinde dönmek"},
                ["translation", "en-tr", "astronomy", "space"]
            ),
            (
                38, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Behavioral economists argue that emotional biases frequently prevent individuals from making rational financial investments.",
                {
                    "A": "Davranışsal iktisatçılar, duygusal ön yargıların bireylerin rasyonel finansal yatırımlar yapmasını sıklıkla engellediğini savunmaktadır.",
                    "B": "Bireylerin rasyonel finansal kararlar alamaması, davranışsal iktisatçılara göre duygusal önyargılardan kaynaklanmaktadır.",
                    "C": "Duygusal önyargıların yatırımları olumsuz etkilediğini belirten davranışsal ekonomistler, rasyonel kararların önemini vurgular.",
                    "D": "Davranışsal iktisatçıların araştırmaları, insanların duygusal davrandıklarında finansal yatırımlarda rasyonel olamadığını gösterir.",
                    "E": "Finansal yatırımlarda yapılan duygusal tercihler, davranışsal iktisatçılar tarafından rasyonel kabul edilmemektedir."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Behavioral economists' (Davranışsal iktisatçılar). Yüklem: 'argue that...' (...savunmaktadır). Nesne cümlesi: 'emotional biases frequently prevent individuals from making rational financial investments' (duygusal ön yargıların bireylerin rasyonel finansal yatırımlar yapmasını sıklıkla engellediğini). A seçeneği eksiksizdir.",
                "Cümle Çevirisi: 'Davranışsal iktisatçılar, duygusal ön yargıların bireylerin rasyonel finansal yatırımlar yapmasını sıklıkla engellediğini savunmaktadır.'",
                {"behavioral": "davranışsal", "bias": "ön yargı, yanlılık", "rational": "mantıklı, rasyonel", "investment": "yatırım"},
                ["translation", "en-tr", "economics", "psychology"]
            ),
            (
                39, "Çeviri", "İngilizce -> Türkçe", "Zor",
                "Deforestation in the Amazon basin not only threatens indigenous tribes who depend on forest resources but also accelerates global atmospheric warming.",
                {
                    "A": "Amazon havzasındaki ormansızlaşma, sadece orman kaynaklarına bağımlı olan yerli kabileleri tehdit etmekle kalmaz, aynı zamanda küresel atmosferik ısınmayı da hızlandırır.",
                    "B": "Orman kaynaklarına bağımlı yerli kabileler Amazon'daki ormansızlaşmadan etkilenirken, küresel atmosfer de bu durumdan ötürü ısınmaktadır.",
                    "C": "Amazon bölgesinde ormanların tahrip edilmesi yerli halkın yaşamını zorlaştırdığı gibi atmosferdeki küresel ısınmayı da tetiklemektedir.",
                    "D": "Küresel atmosferik ısınmanın hızlanması ve yerli kabilelerin tehlikeye girmesi, Amazon havzasında süregelen ormansızlaşmanın sonucudur.",
                    "E": "Amazon havzası ormansızlaştırıldığında hem ormandan geçinen yerli kabileler zarar görmekte hem de küresel iklim dengesi bozulmaktadır."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: 'not only ... but also ...' kalıbı 'sadece ... ile kalmaz, aynı zamanda ... de' olarak çevrilir. Özne: 'Deforestation in the Amazon basin' (Amazon havzasındaki ormansızlaşma). Yüklemler: 'threatens...' (tehdit etmekle kalmaz) ve 'accelerates...' (hızlandırır). A şıkkı tamdır.",
                "Cümle Çevirisi: 'Amazon havzasındaki ormansızlaşma, sadece orman kaynaklarına bağımlı olan yerli kabileleri tehdit etmekle kalmaz, aynı zamanda küresel atmosferik ısınmayı da hızlandırır.'",
                {"deforestation": "ormansızlaşma", "indigenous": "yerli, otokton", "accelerate": "hızlandırmak", "atmospheric": "atmosfere ait"},
                ["translation", "en-tr", "environment", "amazon"]
            ),
            (
                40, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Gökbilimciler, erken evrenin nasıl genişlediğini daha iyi anlamak için en uzak galaksilerden gelen zayıf ışık sinyallerini analiz etmektedir.",
                {
                    "A": "Astronomers analyze faint light signals from the most distant galaxies to better understand how the early universe expanded.",
                    "B": "In order to explain how galaxies expand, astronomers observe faint radiation coming from the ancient cosmos.",
                    "C": "Because the early universe expanded rapidly, astronomers must study faint signals emitted by distant star clusters.",
                    "D": "Faint light from distant galaxies is evaluated by astronomers wishing to explore early cosmic evolution.",
                    "E": "Astronomers have detected faint signals in deep space, demonstrating how the universe originated and expanded."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Özne: 'Astronomers' (Gökbilimciler). Yüklem: 'analyze faint light signals from the most distant galaxies' (en uzak galaksilerden gelen zayıf ışık sinyallerini analiz etmektedir). Amaç: 'to better understand how the early universe expanded' (erken evrenin nasıl genişlediğini daha iyi anlamak için). A şıkkı kusursuzdur.",
                "Cümle Çevirisi: 'Astronomers analyze faint light signals from the most distant galaxies to better understand how the early universe expanded.'",
                {"faint": "zayıf, sönük", "expand": "genişlemek", "galaxy": "galaksi, gök ada", "astronomer": "gökbilimci"},
                ["translation", "tr-en", "space", "astronomy"]
            ),
            (
                41, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Tüketiciler satın alma kararları verirken mantıktan çok sosyal çevrenin ve reklamların etkisi altında kalmaktadır.",
                {
                    "A": "When making purchasing decisions, consumers are influenced more by social circles and advertisements than by logic.",
                    "B": "Because advertisements affect consumers emotionally, purchasing choices rarely reflect logical thinking.",
                    "C": "Consumers rely heavily on their social environment rather than analytical logic while shopping.",
                    "D": "Social circles and commercial advertisements dictate consumer behavior far more than rational decision-making.",
                    "E": "Although consumers believe they act logically, their purchasing choices depend on advertising campaigns."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Zaman cümleciği: 'When making purchasing decisions' (Tüketiciler satın alma kararları verirken). Ana cümle: 'consumers are influenced more by social circles and advertisements than by logic' (tüketiciler mantıktan çok sosyal çevrenin ve reklamların etkisi altında kalmaktadır). A şıkkı tamdır.",
                "Cümle Çevirisi: 'When making purchasing decisions, consumers are influenced more by social circles and advertisements than by logic.'",
                {"purchasing": "satın alma", "consumer": "tüketici", "influence": "etkilemek", "logic": "mantık"},
                ["translation", "tr-en", "marketing", "psychology"]
            ),
            (
                42, "Çeviri", "Türkçe -> İngilizce", "Zor",
                "Tropikal ormanların korunması, hem küresel iklim dengesinin sürdürülmesi hem de henüz keşfedilmemiş türlerin yaşatılması açısından hayati önem taşır.",
                {
                    "A": "The protection of tropical forests is of vital importance both for maintaining the global climate balance and for preserving undiscovered species.",
                    "B": "Protecting tropical rainforests is essential because undiscovered species and the climate system rely on their preservation.",
                    "C": "If tropical forests are preserved, both climate equilibrium and newly discovered biological species will be protected.",
                    "D": "Tropical ecosystems are vital for global climate stability, yet many undiscovered species remain endangered without active protection.",
                    "E": "Maintaining global climate balance requires the conservation of tropical woodlands where unique species dwell."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: 'hayati önem taşır' -> 'is of vital importance'. İkili yapı 'hem ... hem de ...' -> 'both for maintaining ... and for preserving ...'. Özne: 'The protection of tropical forests' (Tropikal ormanların korunması). A şıkkı tam ve eksiksizdir.",
                "Cümle Çevirisi: 'The protection of tropical forests is of vital importance both for maintaining the global climate balance and for preserving undiscovered species.'",
                {"vital importance": "hayati önem", "undiscovered": "keşfedilmemiş", "maintain": "sürdürmek, korumak", "species": "türler"},
                ["translation", "tr-en", "ecology", "biodiversity"]
            )
        ]
    else: # 2018
        return [
            (
                37, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Ocean currents play a crucial role in regulating global climate by redistributing massive amounts of heat from the equator toward the polar regions.",
                {
                    "A": "Okyanus akıntıları, ekvatordan kutup bölgelerine doğru muazzam miktarda ısıyı yeniden dağıtarak küresel iklimin düzenlenmesinde çok önemli bir rol oynar.",
                    "B": "Ekvatordan kutup bölgelerine ısı taşıyan okyanus akıntıları, küresel iklim dengesini sağlamada en etkili unsurlardan biridir.",
                    "C": "Küresel iklimin düzenlenmesi, okyanus akıntılarının büyük miktarda ısıyı kutuplara ulaştırması sayesinde gerçekleşmektedir.",
                    "D": "Okyanus akıntıları ekvator ile kutuplar arasındaki sıcaklığı dengeleyerek küresel iklim üzerinde belirleyici bir etki yaratır.",
                    "E": "Isının ekvatordan kutup bölgelerine yeniden aktarılması, okyanus akıntılarının küresel iklimi kontrol etmesini sağlar."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Ocean currents' (Okyanus akıntıları). Yüklem: 'play a crucial role in regulating global climate' (küresel iklimin düzenlenmesinde çok önemli bir rol oynar). Zarf fiil yapısı: 'by redistributing massive amounts of heat...' (muazzam miktarda ısıyı yeniden dağıtarak). A şıkkı birebirdir.",
                "Cümle Çevirisi: 'Okyanus akıntıları, ekvatordan kutup bölgelerine doğru muazzam miktarda ısıyı yeniden dağıtarak küresel iklimin düzenlenmesinde çok önemli bir rol oynar.'",
                {"current": "akıntı", "crucial role": "çok önemli rol", "equator": "ekvator", "redistribute": "yeniden dağıtmak"},
                ["translation", "en-tr", "oceanography", "climate"]
            ),
            (
                38, "Çeviri", "İngilizce -> Türkçe", "Orta",
                "Fossil findings in Eastern Africa demonstrate that early human ancestors migrated across varied ecological landscapes much earlier than conventional theories suggested.",
                {
                    "A": "Doğu Afrika'daki fosil bulguları, erken insan atalarının geleneksel teorilerin öne sürdüğünden çok daha önce çeşitli ekolojik coğrafyalara göç ettiğini göstermektedir.",
                    "B": "Erken insan atalarının farklı ekolojik bölgelere göçü, Doğu Afrika'da bulunan fosiller sayesinde geleneksel teorileri çürütmüştür.",
                    "C": "Geleneksel teorilerin aksine, Doğu Afrika'daki fosiller ilk insanların ekolojik alanlar arasında erken tarihlerde göç ettiğini kanıtlar.",
                    "D": "Doğu Afrika fosilleri incelendiğinde, erken insanların çeşitli coğrafyalara göç etme sürecinin teorilerden daha eski olduğu anlaşılır.",
                    "E": "İlk insan atalarının ekolojik coğrafyalara yayılması, Doğu Afrika'da yapılan son fosil keşifleriyle açıklığa kavuşmuştur."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: Özne: 'Fossil findings in Eastern Africa' (Doğu Afrika'daki fosil bulguları). Yüklem: 'demonstrate that...' (...göstermektedir). Nesne: 'early human ancestors migrated across varied ecological landscapes much earlier than conventional theories suggested' (erken insan atalarının geleneksel teorilerin öne sürdüğünden çok daha önce çeşitli ekolojik coğrafyalara göç ettiğini). A şıkkı tam oturur.",
                "Cümle Çevirisi: 'Doğu Afrika'daki fosil bulguları, erken insan atalarının geleneksel teorilerin öne sürdüğünden çok daha önce çeşitli ekolojik coğrafyalara göç ettiğini göstermektedir.'",
                {"ancestor": "ata, cet", "fossil": "fosil", "landscape": "coğrafya, manzara", "conventional": "geleneksel"},
                ["translation", "en-tr", "anthropology", "history"]
            ),
            (
                39, "Çeviri", "İngilizce -> Türkçe", "Zor",
                "Unless modern agricultural science preserves wild plant relatives, commercial crops will remain highly susceptible to emerging fungal diseases.",
                {
                    "A": "Modern tarım bilimi yabani bitki akrabalarını korumadıkça, ticari ürünler ortaya çıkan mantar hastalıklarına karşı son derece duyarlı kalacaktır.",
                    "B": "Ticari ürünlerin mantar hastalıklarından korunabilmesi için modern tarım biliminin yabani bitki türlerini muhafaza etmesi gerekir.",
                    "C": "Yabani bitkilerin modern tarım bilimi tarafından korunmaması, ticari mahsullerin mantar enfeksiyonlarına yakalanmasına yol açacaktır.",
                    "D": "Modern tarım bilimcileri yabani türleri korumayı başaramazsa, ortaya çıkan yeni hastalıklar tüm ticari tarımı tehdit edecektir.",
                    "E": "Mantar hastalıklarına karşı hassas olan ticari ürünlerin kurtarılması, yabani bitki akrabalarının acilen korunmasına bağlıdır."
                },
                "A",
                "İngilizce -> Türkçe Çeviri Taktiği: 'Unless ...' bağlacı '-medikçe / -madıkça' koşulunu kurar. 'Unless modern agricultural science preserves wild plant relatives' (Modern tarım bilimi yabani bitki akrabalarını korumadıkça). Ana yüklem: 'will remain highly susceptible to...' (...karşı son derece duyarlı kalacaktır). A şıkkı tam ve eksiksizdir.",
                "Cümle Çevirisi: 'Modern tarım bilimi yabani bitki akrabalarını korumadıkça, ticari ürünler ortaya çıkan mantar hastalıklarına karşı son derece duyarlı kalacaktır.'",
                {"susceptible": "duyarlı, hassas, yatkın", "fungal": "mantara ait", "preserve": "korumak", "relative": "akraba"},
                ["translation", "en-tr", "agriculture", "botany"]
            ),
            (
                40, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Eski çağlarda kuraklık ve kıtlık gibi şiddetli iklim krizleri, insan topluluklarının verimli nehir vadilerine doğru kitlesel göçler yapmasına neden olmuştur.",
                {
                    "A": "In ancient times, severe climate crises such as drought and famine caused human populations to migrate en masse toward fertile river valleys.",
                    "B": "Because drought and famine struck ancient societies, human communities were forced to settle in fertile river regions.",
                    "C": "Severe climate conditions like drought in ancient periods led human tribes to seek water resources in river valleys.",
                    "D": "Ancient human populations migrated to fertile river valleys whenever severe climate crises threatened their food security.",
                    "E": "Mass migrations toward river valleys in ancient times occurred mainly because agricultural communities faced chronic famines."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Zaman zarfı: 'In ancient times' (Eski çağlarda). Özne: 'severe climate crises such as drought and famine' (kuraklık ve kıtlık gibi şiddetli iklim krizleri). Yüklem: 'caused human populations to migrate en masse toward fertile river valleys' (insan topluluklarının verimli nehir vadilerine doğru kitlesel göçler yapmasına neden olmuştur). A şıkkı tamdır.",
                "Cümle Çevirisi: 'In ancient times, severe climate crises such as drought and famine caused human populations to migrate en masse toward fertile river valleys.'",
                {"famine": "kıtlık, açlık", "drought": "kuraklık", "fertile": "verimli", "en masse": "kitlesel olarak, topluca"},
                ["translation", "tr-en", "history", "climate"]
            ),
            (
                41, "Çeviri", "Türkçe -> İngilizce", "Orta",
                "Bitki genetikçileri, kuraklığa dayanıklı yeni buğday çeşitleri geliştirmek amacıyla yabani ot türlerinin genetik dizilimini haritalandırmaktadır.",
                {
                    "A": "Plant geneticists are mapping the genetic sequences of wild grass species in order to develop new drought-resistant wheat varieties.",
                    "B": "Because drought-resistant wheat is needed, botanists analyze wild grass genes in agricultural laboratories.",
                    "C": "In order to create new wheat crops, plant scientists study how wild grasses survive severe climate conditions.",
                    "D": "Wild grass genomes are being decoded by plant geneticists so that commercial farmers can cultivate drought-resistant wheat.",
                    "E": "Developing drought-resistant wheat varieties requires plant geneticists to map ancestral wild plants comprehensively."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Özne: 'Plant geneticists' (Bitki genetikçileri). Yüklem: 'are mapping the genetic sequences of wild grass species' (yabani ot türlerinin genetik dizilimini haritalandırmaktadır). Amaç: 'in order to develop new drought-resistant wheat varieties' (kuraklığa dayanıklı yeni buğday çeşitleri geliştirmek amacıyla). A şıkkı tamdır.",
                "Cümle Çevirisi: 'Plant geneticists are mapping the genetic sequences of wild grass species in order to develop new drought-resistant wheat varieties.'",
                {"geneticist": "genetikçi", "sequence": "dizilim, sıra", "drought-resistant": "kuraklığa dayanıklı", "wheat": "buğday"},
                ["translation", "tr-en", "genetics", "agriculture"]
            ),
            (
                42, "Çeviri", "Türkçe -> İngilizce", "Zor",
                "Okyanusların derin sularındaki sıcaklık değişimlerini ölçmek, gelecekteki küresel hava olaylarını aylar öncesinden tahmin etmeyi mümkün kılmaktadır.",
                {
                    "A": "Measuring temperature fluctuations in the deep waters of oceans makes it possible to predict future global weather phenomena months in advance.",
                    "B": "If scientists measure deep ocean water temperatures, global weather events can be anticipated several months earlier.",
                    "C": "Predicting global weather anomalies months in advance depends largely on monitoring thermal shifts in ocean currents.",
                    "D": "Because deep ocean temperatures fluctuate, meteorologists can accurately forecast extreme weather patterns worldwide.",
                    "E": "Measuring ocean thermal levels allows researchers to warn the public about incoming catastrophic climate events in advance."
                },
                "A",
                "Türkçe -> İngilizce Çeviri Taktiği: Özne: 'Measuring temperature fluctuations in the deep waters of oceans' (Okyanusların derin sularındaki sıcaklık değişimlerini ölçmek). Yüklem: 'makes it possible to predict future global weather phenomena months in advance' (...gelecekteki küresel hava olaylarını aylar öncesinden tahmin etmeyi mümkün kılmaktadır). A şıkkı tam ve kusursuzdur.",
                "Cümle Çevirisi: 'Measuring temperature fluctuations in the deep waters of oceans makes it possible to predict future global weather phenomena months in advance.'",
                {"fluctuation": "dalgalanma, değişim", "phenomenon": "olay, fenomen", "in advance": "önceden", "predict": "tahmin etmek"},
                ["translation", "tr-en", "oceanography", "meteorology"]
            )
        ]

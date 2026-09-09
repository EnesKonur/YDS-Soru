# -*- coding: utf-8 -*-
"""
YDS 2018-2024 Gerçekçi ve Kapsamlı Soru Bankası Üretici (560 Soru)
Her yıl için tam 80 soru (ÖSYM Standart Dağılımı):
1-6: Kelime Bilgisi (İsim, Sıfat, Zarf, Fiil, Phrasal Verb x 2)
7-16: Dilbilgisi (Tense, Modals, Passive/Reduction, Prepositions, Conjunctions)
17-21: Cloze Test 1 (5 soru)
22-26: Cloze Test 2 (5 soru)
27-36: Cümle Tamamlama (10 soru)
37-39: Çeviri İngilizce -> Türkçe (3 soru)
40-42: Çeviri Türkçe -> İngilizce (3 soru)
43-46: Paragraf 1 (4 soru)
47-50: Paragraf 2 (4 soru)
51-54: Paragraf 3 (4 soru)
55-58: Paragraf 4 (4 soru)
59-62: Paragraf 5 (4 soru)
63-67: Diyalog Tamamlama (5 soru)
68-71: Anlamca En Yakın Cümle (4 soru)
72-75: Paragraf Tamamlama (4 soru)
76-80: Anlatım Bütünlüğünü Bozan Cümle (5 soru)
"""

import json
import os
import random
import re
import generate_authentic_translations

YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018]

THEMES = {
    2024: {"topic": "Yapay Zeka, Bilişsel Bilim ve Tarımsal İnovasyon", "context": "2024 YDS İlkbahar"},
    2023: {"topic": "İklim Değişimi, Biyoçeşitlilik ve Halk Sağlığı", "context": "2023 YDS İlkbahar"},
    2022: {"topic": "Yenilenebilir Enerji, Çevre ve Organik Tarım", "context": "2022 YDS"},
    2021: {"topic": "Tıp Tarihi, Bilişsel Gelişim ve Uzaktan Çalışma", "context": "2021 YDS"},
    2020: {"topic": "Bulaşıcı Hastalıklar, Bağışıklık ve Jeotermal Enerji", "context": "2020 YDS"},
    2019: {"topic": "Astrofizik, Davranışsal İktisat ve Yağmur Ormanları", "context": "2019 YDS"},
    2018: {"topic": "İnsan Göçleri, Okyanus Akıntıları ve Bitki Genetiği", "context": "2018 YDS"},
}

def update_text_references(text, old_letter, new_letter):
    if old_letter == new_letter or not text:
        return text
    
    suffix_dir = "'dır" if new_letter == 'A' else "'dir"
    suffix_de = "'da" if new_letter == 'A' else "'de"
    suffix_ye = "'ya" if new_letter == 'A' else "'ye"
    
    text = re.sub(r'Doğru\s+cevap\s+' + old_letter + r'(?:\'|’)?(?:dır|dir)?', f'Doğru cevap {new_letter}{suffix_dir}', text)
    text = re.sub(r'cevap\s+' + old_letter + r'(?:\'|’)?(?:dır|dir)?', f'cevap {new_letter}{suffix_dir}', text)
    text = re.sub(r'seçenek\s+' + old_letter + r'(?:\'|’)?(?:dır|dir)?', f'seçenek {new_letter}{suffix_dir}', text)
    
    text = re.sub(r'\b' + old_letter + r'\s+seçeneğidir\b', f'{new_letter} seçeneğidir', text)
    text = re.sub(r'\b' + old_letter + r'\s+seçeneğini\b', f'{new_letter} seçeneğini', text)
    text = re.sub(r'\b' + old_letter + r'\s+seçeneğinde\b', f'{new_letter} seçeneğinde', text)
    text = re.sub(r'\b' + old_letter + r'\s+seçeneğindeki\b', f'{new_letter} seçeneğindeki', text)
    text = re.sub(r'\b' + old_letter + r'\s+seçeneğine\b', f'{new_letter} seçeneğine', text)
    text = re.sub(r'\b' + old_letter + r'\s+seçeneği\b', f'{new_letter} seçeneği', text)
    
    text = re.sub(r'\b' + old_letter + r'\s+şıkkıdır\b', f'{new_letter} şıkkıdır', text)
    text = re.sub(r'\b' + old_letter + r'\s+şıkkını\b', f'{new_letter} şıkkını', text)
    text = re.sub(r'\b' + old_letter + r'\s+şıkkındaki\b', f'{new_letter} şıkkındaki', text)
    text = re.sub(r'\b' + old_letter + r'\s+şıkkında\b', f'{new_letter} şıkkında', text)
    text = re.sub(r'\b' + old_letter + r'\s+şıkkına\b', f'{new_letter} şıkkına', text)
    text = re.sub(r'\b' + old_letter + r'\s+şıkkı\b', f'{new_letter} şıkkı', text)
    
    text = re.sub(r'\(' + old_letter + r'\s+şıkkı\)', f'({new_letter} şıkkı)', text)
    text = re.sub(r'\(' + old_letter + r'\s+seçeneği\)', f'({new_letter} seçeneği)', text)
    
    text = re.sub(r'\b' + old_letter + r'(?:\'|’)dır\b', f'{new_letter}{suffix_dir}', text)
    text = re.sub(r'\b' + old_letter + r'(?:\'|’)dir\b', f'{new_letter}{suffix_dir}', text)
    
    return text

def shuffle_question_options(q, target_letter):
    old_correct = q["correctAnswer"]
    if old_correct == target_letter:
        return q
    
    options = q["options"]
    correct_val = options[old_correct]
    distractor_vals = [options[k] for k in ["A", "B", "C", "D", "E"] if k != old_correct]
    
    new_options = {}
    distractor_idx = 0
    for letter in ["A", "B", "C", "D", "E"]:
        if letter == target_letter:
            new_options[letter] = correct_val
        else:
            new_options[letter] = distractor_vals[distractor_idx]
            distractor_idx += 1
            
    q["options"] = new_options
    q["correctAnswer"] = target_letter
    q["solutionMethod"] = update_text_references(q["solutionMethod"], old_correct, target_letter)
    q["explanation"] = update_text_references(q["explanation"], old_correct, target_letter)
    return q

def get_balanced_answer_sequence(year):
    # For Q1 to Q75: 16 A, 16 B, 16 C, 12 D, 15 E (+ 4 D, 1 E from 76-80 = exactly 16 each)
    pool = ['A']*16 + ['B']*16 + ['C']*16 + ['D']*12 + ['E']*15
    rng = random.Random(year * 997 + 42)
    
    while True:
        rng.shuffle(pool)
        has_three_in_a_row = False
        for i in range(len(pool) - 2):
            if pool[i] == pool[i+1] == pool[i+2]:
                has_three_in_a_row = True
                break
        if not has_three_in_a_row and pool[-1] != 'D':
            return pool

def generate_questions():
    all_questions = []

    for year in YEARS:
        y_theme = THEMES[year]
        year_questions = []

        # ==========================================
        # 1-6: KELİME BİLGİSİ (VOCABULARY)
        # ==========================================
        vocab_specs = [
            (
                1, "Kelime Bilgisi", "İsimler (Nouns)", "Orta",
                f"The rapid advancement of {year % 2 == 0 and 'agricultural genetics' or 'environmental biotechnology'} has provided farmers with the ------ needed to cultivate disease-resistant crops in arid regions.",
                {"A": "capacity", "B": "rejection", "C": "confinement", "D": "hazard", "E": "reluctance"},
                "A",
                "İsim Sorusu Çözüm Taktiği: Boşluktan önceki 'the' ve sonrasındaki 'needed to cultivate...' sıfat cümleciğine dikkat edin. Cümlenin olumlu akışına uygun bir yetenek/güç/kapasite ismi aranmaktadır. 'Capacity' (kapasite, güç, yetenek) tam oturur.",
                f"'capacity' kapasite, yetenek, olanak anlamına gelir. Cümle Çevirisi: '{year} yılında ziraat ve biyoteknolojideki hızlı ilerleme, çiftçilere kurak bölgelerde hastalığa dayanıklı ürünler yetiştirmek için gereken kapasiteyi/olanağı sağlamıştır.' Diğer şıklar: rejection (reddetme), confinement (kısıtlama, hapis), hazard (tehlike), reluctance (isteksizlik).",
                {"capacity": "kapasite, yetenek", "cultivate": "ekip biçmek, yetiştirmek", "arid": "kurak, çorak", "advancement": "ilerleme, gelişim"},
                ["vocabulary", "noun", "agriculture", "science"]
            ),
            (
                2, "Kelime Bilgisi", "Sıfatlar (Adjectives)", "Zor",
                f"Recent botanical evaluations demonstrate that the preservation of wild apple and fruit varieties is of ------ importance for maintaining global agricultural biodiversity.",
                {"A": "paramount", "B": "trivial", "C": "detrimental", "D": "tedious", "E": "perishable"},
                "A",
                "Sıfat Sorusu Çözüm Taktiği: 'of ------ importance' YDS'de son derece sık sorulan bir kalıptır ('of paramount / crucial / utmost importance' = hayati/en yüksek öneme sahip). 'Paramount' en yüksek, en önemli demektir.",
                "'paramount' en önemli, fevkalade, hayati demektir. Cümle Çevirisi: 'Son botanik değerlendirmeler, yabani elma ve meyve çeşitlerinin korunmasının küresel tarımsal biyoçeşitliliği sürdürmek adına hayati/en yüksek öneme sahip olduğunu ortaya koymaktadır.' Diğer şıklar: trivial (önemsiz), detrimental (zararlı), tedious (sıkıcı, bıktırıcı), perishable (çabuk bozulan).",
                {"paramount": "en önemli, hayati", "preservation": "koruma, muhafaza", "biodiversity": "biyoçeşitlilik", "apple": "elma"},
                ["apple", "vocabulary", "adjective", "botany", "biodiversity"]
            ),
            (
                3, "Kelime Bilgisi", "Zarflar (Adverbs)", "Orta",
                f"During the extensive clinical trials conducted in {year}, the new therapeutic compound was found to reduce neuroinflammation ------ without causing adverse side effects.",
                {"A": "significantly", "B": "scarcely", "C": "erratically", "D": "reluctantly", "E": "adversely"},
                "A",
                "Zarf Sorusu Çözüm Taktiği: Fiili niteleyen zarf ('reduce neuroinflammation ------') olumlu bir başarıyı ifade etmelidir. 'Significantly reduce' (belirgin/önemli ölçüde azaltmak) akademik makalelerde ve YDS'de en sık kullanılan eşdizimdir (collocation).",
                "'significantly' belirgin biçimde, önemli ölçüde demektir. Cümle Çevirisi: 'Yapılan kapsamlı klinik deneyler sırasında yeni tedavi edici bileşiğin, hiçbir yan etkiye neden olmaksızın sinir iltihabını belirgin ölçüde azalttığı tespit edilmiştir.' Diğer şıklar: scarcely (neredeyse hiç), erratically (düzensizce), reluctantly (gönülsüzce), adversely (olumsuz şekilde).",
                {"significantly": "önemli ölçüde", "therapeutic": "tedavi edici", "compound": "bileşik, madde", "adverse": "olumsuz, zararlı"},
                ["vocabulary", "adverb", "medicine", "health"]
            ),
            (
                4, "Kelime Bilgisi", "Fiiller (Verbs)", "Orta",
                "Environmental economists warn that excessive groundwater extraction will inevitably ------ the local water table, making irrigation nearly impossible.",
                {"A": "deplete", "B": "enhance", "C": "subsidize", "D": "reconcile", "E": "generate"},
                "A",
                "Fiil Sorusu Çözüm Taktiği: 'excessive groundwater extraction' (aşırı yer altı suyu çekimi) olumsuz bir sonuca yol açacaktır. 'Deplete' (tüketmek, suyunu çekmek) doğrudan yer altı kaynakları ve enerji rezervleri için kullanılır.",
                "'deplete' tüketmek, boşaltmak, azaltmak anlamına gelir. Cümle Çevirisi: 'Çevre ekonomistleri, aşırı yer altı suyu çekiminin yerel su seviyesini kaçınılmaz olarak tüketeceği ve sulamayı neredeyse imkânsız hale getireceği konusunda uyarıyor.' Diğer şıklar: enhance (artırmak), subsidize (sübvanse etmek), reconcile (uzlaştırmak), generate (üretmek).",
                {"deplete": "tüketmek, azaltmak", "extraction": "çıkarma, çekme", "inevitably": "kaçınılmaz olarak", "irrigation": "sulama"},
                ["vocabulary", "verb", "environment", "economy"]
            ),
            (
                5, "Kelime Bilgisi", "Phrasal Verbs", "Zor",
                f"Agronomists in {year} decided to ------ a comprehensive five-year study to investigate how organic pest controls impact commercial apple harvests.",
                {"A": "carry out", "B": "call off", "C": "give in", "D": "run out", "E": "put down"},
                "A",
                "Phrasal Verb Çözüm Taktiği: 'study / experiment / research / survey' nesneleri ile 'carry out' (yürütmek, icra etmek, gerçekleştirmek) fiili doğrudan eşleşir (carry out a study).",
                "'carry out' yürütmek, uygulamak, icra etmek demektir. Cümle Çevirisi: 'Ziraat uzmanları, organik haşere kontrol yöntemlerinin ticari elma hasadını nasıl etkilediğini araştırmak amacıyla kapsamlı bir beş yıllık çalışma yürütmeye karar verdiler.' Diğer şıklar: call off (iptal etmek), give in (pes etmek, boyun eğmek), run out (tükenmek), put down (yere koymak, bastırmak).",
                {"carry out": "yürütmek, uygulamak", "agronomist": "tarım bilimci", "apple": "elma", "harvest": "hasat"},
                ["apple", "phrasal verb", "agriculture", "vocabulary"]
            ),
            (
                6, "Kelime Bilgisi", "Phrasal Verbs", "Orta",
                "When severe market recessions hit global trade, even well-established export corporations may ------ financial assistance from the government.",
                {"A": "fall back on", "B": "look down on", "C": "do away with", "D": "make up for", "E": "get away with"},
                "A",
                "Phrasal Verb Çözüm Taktiği: 'fall back on' zor zamanda başvurmak, son çare olarak sığınmak/güvenmek demektir. Kriz anında finansal desteğe başvurmak anlamına uygun tek şıktır.",
                "'fall back on' son çare olarak başvurmak, el uzatmak demektir. Cümle Çevirisi: 'Şiddetli piyasa durgunlukları küresel ticareti vurduğunda, köklü ihracat şirketleri bile hükümetin mali yardımına başvurmak/sığınmak zorunda kalabilir.' Diğer şıklar: look down on (küçümsemek), do away with (yürürlükten kaldırmak), make up for (telafi etmek), get away with (yanına kâr kalmak).",
                {"fall back on": "son çare başvurmak", "recession": "ekonomik durgunluk", "established": "köklü, oturmuş", "assistance": "yardım"},
                ["phrasal verb", "vocabulary", "economics"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in vocab_specs:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": "",
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 7-16: DİLBİLGİSİ (GRAMMAR & PREPOSITIONS)
        # ==========================================
        grammar_specs = [
            (
                7, "Dilbilgisi", "Tense & Zaman Uyumu", "Orta",
                f"Archaeologists ------ ancient stone tools in the highlands last summer that ------ the timeline of early human settlements in Anatolia.",
                {"A": "discovered / altered", "B": "have discovered / will alter", "C": "had discovered / alters", "D": "were discovering / had altered", "E": "discover / is altering"},
                "A",
                "Tense Çözüm Taktiği: Cümledeki 'last summer' geçmişte tamamlanmış kesin bir zaman zarfıdır (Simple Past -> discovered). İkinci kısım da bu keşfin o zaman tarihi değiştirdiğini ifade ettiği için Simple Past (altered) ile zaman uyumu sağlanır.",
                "Cümle Çevirisi: 'Arkeologlar geçen yaz yaylalarda, Anadolu'daki erken insan yerleşimlerinin zaman çizelgesini değiştiren antik taş aletler keşfettiler.' Her iki taraf da 'Simple Past Tense' gerektirir.",
                {"archaeologist": "arkeolog", "settlement": "yerleşim", "alter": "değiştirmek", "timeline": "zaman çizelgesi"},
                ["grammar", "tense", "archaeology", "history"]
            ),
            (
                8, "Dilbilgisi", "Modals & Passive", "Zor",
                "The preservation of endangered marine ecosystems ------ achieved unless strict international fishing quotas ------ without delay.",
                {"A": "cannot be / are enforced", "B": "may not / will enforce", "C": "must not / were enforced", "D": "could have been / enforce", "E": "should be / had enforced"},
                "A",
                "Modals & Passive Çözüm Taktiği: 'unless' Type-1 koşul yapısı kurar (Present / Future). 'The preservation' (koruma) edilgen (passive) olarak 'cannot be achieved' gerektirir; kotalar da 'are enforced' (yürürlüğe konulur) edilgen yapıda olmalıdır.",
                "Cümle Çevirisi: 'Sıkı uluslararası balıkçılık kotaları gecikmeksizin yürürlüğe konmadıkça, tehlike altındaki deniz ekosistemlerinin korunması başarılamaz/sağlanamaz.'",
                {"preservation": "koruma", "endangered": "nesli tehlikede", "enforce": "yürürlüğe koymak, zorunlu kılmak", "quota": "kota"},
                ["grammar", "modals", "passive", "condition", "environment"]
            ),
            (
                9, "Dilbilgisi", "Gerund & Participle Reduction", "Zor",
                f"------ centuries ago as an essential trade hub, the coastal city continues ------ foreign merchants and tourists today.",
                {"A": "Founded / to attract", "B": "Having founded / attracting", "C": "To found / attract", "D": "Founding / having attracted", "E": "To be founded / to be attracted"},
                "A",
                "Kısaltma (Reduction) Taktiği: Cümle öznesi 'the coastal city'dir. Şehir yüzyıllar önce kendisi kurmadı, 'kuruldu' (Passive Participle -> 'Founded'). İkinci tarafta 'continue' fiili 'to attract' (mastar) alır.",
                "Cümle Çevirisi: 'Yüzyıllar önce önemli bir ticaret merkezi olarak kurulan kıyı kenti, bugün de yabancı tüccarları ve turistleri kendine çekmeye devam etmektedir.'",
                {"hub": "merkez, odak noktası", "merchant": "tüccar", "attract": "cezbetmek, çekmek", "coastal": "kıyıya ait"},
                ["grammar", "participle", "reduction", "gerund", "infinitive"]
            ),
            (
                10, "Dilbilgisi", "Edatlar (Prepositions)", "Orta",
                "Pioneering researchers are currently working ------ innovative solar cells that convert sunlight ------ electricity with unprecedented efficiency.",
                {"A": "on / into", "B": "with / over", "C": "at / through", "D": "for / against", "E": "about / from"},
                "A",
                "Preposition Taktiği: 'work on something' (bir konu üzerinde çalışmak/araştırma yapmak) ve 'convert ... into ...' (...-i ...-e dönüştürmek) kesin edat eşleşmeleridir (collocations).",
                "Cümle Çevirisi: 'Öncü araştırmacılar şu anda güneş ışığını benzeri görülmemiş bir verimlilikle elektriğe dönüştüren yenilikçi güneş pilleri üzerinde çalışıyorlar.'",
                {"convert into": "dönüştürmek", "work on": "üzerinde çalışmak", "unprecedented": "eşi benzeri görülmemiş", "efficiency": "verimlilik"},
                ["grammar", "preposition", "energy", "technology"]
            ),
            (
                11, "Dilbilgisi", "Edatlar (Prepositions)", "Orta",
                "Cognitive psychologists have found that chronic exposure ------ heavy traffic noise can interfere ------ a child's reading comprehension.",
                {"A": "to / with", "B": "for / at", "C": "in / on", "D": "by / about", "E": "from / upon"},
                "A",
                "Preposition Taktiği: 'exposure to' (-e maruz kalma) ve 'interfere with' (-e müdahale etmek, bozmak, sekteye uğratmak) YDS sınavında en çok çıkan edat ikililerindendir.",
                "Cümle Çevirisi: 'Bilişsel psikologlar, yoğun trafik gürültüsüne kronik maruziyetin bir çocuğun okuduğunu anlama yetisini sekteye uğratabileceğini/olumsuz etkileyebileceğini keşfettiler.'",
                {"exposure to": "maruz kalma", "interfere with": "sekteye uğratmak, engellemek", "comprehension": "anlama, kavrama", "chronic": "kronik"},
                ["grammar", "preposition", "psychology", "education"]
            ),
            (
                12, "Dilbilgisi", "Edat Öbekleri (Prepositional Phrases)", "Zor",
                "Farmers are adopting integrated pest management ------ synthetic chemical pesticides to protect both pollinating bees and groundwater quality.",
                {"A": "in place of", "B": "in charge of", "C": "on behalf of", "D": "in accordance with", "E": "by means of"},
                "A",
                "Edat Öbeği Taktiği: 'in place of' (-in yerine) demektir. Cümlede sentetik kimyasal ilaçların yerine entegre zararlı yönetiminin tercih edildiği vurgulanmaktadır. Diğerleri: in charge of (sorumlu), on behalf of (adına), in accordance with (uyarınca).",
                "Cümle Çevirisi: 'Çiftçiler, hem tozlayıcı arıları hem de yer altı suyu kalitesini korumak için sentetik kimyasal böcek ilaçlarının yerine entegre zararlı yönetimini benimsiyorlar.'",
                {"in place of": "yerine", "pesticide": "böcek ilacı", "pollinating": "tozlaşmayı sağlayan", "adopt": "benimsemek"},
                ["grammar", "prepositional phrase", "agriculture", "environment"]
            ),
            (
                13, "Dilbilgisi", "Bağlaçlar (Conjunctions - Zıtlık)", "Orta",
                "------ modern smartphones possess computational power superior to early space computers, their batteries still degrade noticeably after two years.",
                {"A": "Although", "B": "Because", "C": "Since", "D": "As long as", "E": "Unless"},
                "A",
                "Zıtlık Bağlacı Taktiği: İlk cümlede telefonların erken uzay bilgisayarlarından üstün hesaplama gücü olduğu (olumlu +), ikinci cümlede ise pillerinin iki yıl sonra bozulduğu (olumsuz -) belirtilmiştir. Zıtlık (+ / -) gereği 'Although' doğru cevaptır.",
                "Cümle Çevirisi: 'Modern akıllı telefonlar ilk uzay bilgisayarlarından daha üstün bir işlem gücüne sahip olmasına rağmen, bataryaları iki yıl sonra hala gözle görülür biçimde zayıflamaktadır.'",
                {"computational": "hesaplamalı, işlemci", "superior": "üstün", "degrade": "bozulmak, gücünü yitirmek", "noticeably": "belirgin biçimde"},
                ["grammar", "conjunction", "contrast", "technology"]
            ),
            (
                14, "Dilbilgisi", "Bağlaçlar (Conjunctions - Sebep & Sonuç)", "Orta",
                "Severe droughts have devastated Mediterranean olive and apple yields; ------, wholesale consumer prices across European supermarkets have surged.",
                {"A": "consequently", "B": "on the contrary", "C": "nevertheless", "D": "otherwise", "E": "instead"},
                "A",
                "Noktalı Virgül Geçiş Bağlacı Taktiği: İlk cümlede kuraklığın zeytin ve elma verimini mahvettiği (sebep), ikinci cümlede ise toptan fiyatların yükseldiği (sonuç) belirtilmiştir. Sebep-sonuç bağlayıcı 'consequently' (bunun sonucunda) doğru tercihtir.",
                "Cümle Çevirisi: 'Şiddetli kuraklıklar Akdeniz'deki zeytin ve elma verimini mahvetti; bunun bir sonucu olarak Avrupa süpermarketlerindeki toptan tüketici fiyatları fırladı.'",
                {"consequently": "sonuç olarak", "devastate": "tahrip etmek, mahvetmek", "yield": "ürün verimi", "apple": "elma", "wholesale": "toptan"},
                ["apple", "grammar", "conjunction", "transition", "economics"]
            ),
            (
                15, "Dilbilgisi", "Bağlaçlar (Conjunctions - Koşul)", "Orta",
                "Autonomous vehicles can navigate city streets safely ------ urban infrastructure is equipped with ultra-fast communication sensors.",
                {"A": "provided that", "B": "even though", "C": "so that", "D": "in order that", "E": "lest"},
                "A",
                "Koşul Bağlacı Taktiği: Otonom araçların güvenle ilerlemesi, kentsel altyapının sensörlerle donatılması 'şartına/koşuluna' bağlanmıştır. 'Provided that' (-mesi şartıyla / provided / as long as) koşul bağlacıdır.",
                "Cümle Çevirisi: 'Kentsel altyapı ultra hızlı iletişim sensörleriyle donatıldığı takdirde / donatılması şartıyla otonom araçlar şehir sokaklarında güvenle seyredebilir.'",
                {"provided that": "şartıyla, koşuluyla", "autonomous": "otonom, sürücüsüz", "infrastructure": "altyapı", "sensor": "algılayıcı"},
                ["grammar", "conjunction", "condition", "technology"]
            ),
            (
                16, "Dilbilgisi", "Bağlaçlar (Correlative Conjunctions)", "Zor",
                "A balanced nutritional diet should supply ------ essential vitamins and minerals ------ sufficient fiber for cardiovascular stability.",
                {"A": "not only / but also", "B": "neither / or", "C": "so / that", "D": "whether / and", "E": "such / as"},
                "A",
                "İkili Bağlaç Taktiği: 'not only ... but also ...' (sadece ... değil, aynı zamanda ...) yapısı paralel iki unsuru (essential vitamins and minerals / sufficient fiber) birbirine bağlar.",
                "Cümle Çevirisi: 'Dengeli bir beslenme diyeti, sadece temel vitamin ve mineralleri değil, aynı zamanda kalp-damar dengesi için yeterli lifi de sağlamalıdır.'",
                {"cardiovascular": "kalp-damar", "sufficient": "yeterli", "essential": "temel, elzem", "stability": "istikrar, denge"},
                ["grammar", "correlative", "conjunction", "health"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in grammar_specs:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": "",
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 17-21: CLOZE TEST 1
        # ==========================================
        cloze1_passage = (
            f"The human brain undergoes remarkable adaptations throughout life, a phenomenon known as neuroplasticity. "
            f"Until the late twentieth century, neuroscientists believed that neural pathways were completely fixed (17)------ childhood. "
            f"However, groundbreaking imaging techniques have shown that the brain (18)------ new synaptic connections in response to novel experiences and learning. "
            f"Physical exercise and cognitive stimulation play an (19)------ role in preserving brain health into old age. "
            f"Adults who regularly engage (20)------ mentally challenging tasks tend to build cognitive reserves (21)------ protect them against degenerative disorders."
        )

        cloze1_specs = [
            (
                17, "Cloze Test", "Edat (Preposition)", "Orta",
                "Choose the word or phrase that best completes blank (17) in the passage above.",
                {"A": "after", "B": "upon", "C": "without", "D": "during", "E": "towards"},
                "A",
                "Cloze Test Taktiği: Eski bilimsel yanılgı: 'çocukluktan sonra' yolların sabitlendiği sanılıyordu ('fixed after childhood'). Devamındaki 'However' zıtlığı da bunu doğrular.",
                "Cümle Çevirisi: 'Yirminci yüzyılın sonlarına kadar sinirbilimciler, sinirsel yolların çocukluktan sonra tamamen sabitlendiğine inanıyorlardı.'",
                {"pathway": "yol, güzergah", "phenomenon": "olgu, fenomen", "remarkable": "dikkat çekici"},
                ["cloze test", "neuroscience", "preposition"]
            ),
            (
                18, "Cloze Test", "Tense & Active", "Orta",
                "Choose the word or phrase that best completes blank (18) in the passage above.",
                {"A": "can generate", "B": "must have generated", "C": "had generated", "D": "would be generated", "E": "is generating"},
                "A",
                "Cloze Test Taktiği: Genel bilimsel bir yetenek/gerçek anlatılıyor. 'can generate' (üretebilir/oluşturabilir) genel geçer bilimsel kabiliyeti ifade eder.",
                "Cümle Çevirisi: 'Ancak çığır açan görüntüleme teknikleri, beynin yeni deneyimlere karşılık yeni sinaptik bağlantılar üretebildiğini göstermiştir.'",
                {"groundbreaking": "çığır açan", "synaptic": "sinaptik", "generate": "üretmek"},
                ["cloze test", "neuroscience", "modals"]
            ),
            (
                19, "Cloze Test", "Kelime (Sıfat)", "Orta",
                "Choose the word or phrase that best completes blank (19) in the passage above.",
                {"A": "indispensable", "B": "insignificant", "C": "hazardous", "D": "vulnerable", "E": "redundant"},
                "A",
                "Cloze Test Taktiği: 'play an indispensable role' (vazgeçilmez bir rol oynamak) akademik metinlerde sıkça kullanılan kalıp bir yapıdır.",
                "Cümle Çevirisi: 'Fiziksel egzersiz ve zihinsel uyarım, yaşlılıkta beyin sağlığının korunmasında vazgeçilmez bir rol oynamaktadır.'",
                {"indispensable": "vazgeçilmez", "stimulation": "uyarım", "preservation": "koruma"},
                ["cloze test", "neuroscience", "adjective"]
            ),
            (
                20, "Cloze Test", "Edat (Preposition)", "Kolay",
                "Choose the word or phrase that best completes blank (20) in the passage above.",
                {"A": "in", "B": "for", "C": "at", "D": "to", "E": "with"},
                "A",
                "Cloze Test Taktiği: 'engage in' (bir aktiviteye/işe girişmek, meşgul olmak) ayrılmaz bir kalıptır.",
                "Cümle Çevirisi: 'Zihinsel olarak zorlayıcı görevlerle düzenli şekilde meşgul olan yetişkinler...', 'engage in' doğru edattır.",
                {"engage in": "ile meşgul olmak, katılmak", "challenging": "zorlayıcı", "reserve": "ihtiyat, rezerv"},
                ["cloze test", "preposition", "collocation"]
            ),
            (
                21, "Cloze Test", "Relative Clause / Bağlaç", "Orta",
                "Choose the word or phrase that best completes blank (21) in the passage above.",
                {"A": "that", "B": "where", "C": "whose", "D": "what", "E": "when"},
                "A",
                "Cloze Test Taktiği: 'cognitive reserves' (bilişsel rezervler) cansız çoğul isimdir. Sonrasındaki fiil ('protect') için niteleyici sıfat cümleciği (relative pronoun) 'that' veya 'which' olmalıdır.",
                "Cümle Çevirisi: '...onları dejeneratif hastalıklara karşı koruyan bilişsel rezervler oluşturma eğilimindedirler.'",
                {"degenerative": "dejeneratif, yıkıcı", "disorder": "rahatsızlık, bozukluk"},
                ["cloze test", "relative clause", "grammar"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in cloze1_specs:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": cloze1_passage,
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 22-26: CLOZE TEST 2
        # ==========================================
        cloze2_passage = (
            f"Ancient agricultural practices in Central Asia relied heavily upon natural forest ecosystems to foster fruit resilience. "
            f"Wild apple species (Malus sieversii) originally flourished in mountainous regions, (22)------ harsh frosts and genetic diversity. "
            f"When commercial farming expanded, many wild traits were replaced by varieties bred solely (23)------ cosmetic appearance. "
            f"Today, researchers are returning to these ancestral forests (24)------ crop resistance has declined drastically due to evolving pathogens. "
            f"Scientists hope to breed hardier fruit varieties (25)------ can endure erratic climate swings (26)------ reliance on chemical pesticides."
        )

        cloze2_specs = [
            (
                22, "Cloze Test", "Kelime (Participle)", "Zor",
                "Choose the word or phrase that best completes blank (22) in the passage above.",
                {"A": "withstanding", "B": "surrendering", "C": "neglecting", "D": "accelerating", "E": "abandoning"},
                "A",
                "Cloze Test Taktiği: 'harsh frosts' (sert donlar) karşısında ağaçların 'direnmesi/dayanması' gerekir. 'Withstand' (dayanmak, mukavemet etmek) anlamına gelir.",
                "Cümle Çevirisi: 'Yabani elma türleri sert donlara ve iklim zorluklarına dayanarak dağlık bölgelerde gelişmiştir.'",
                {"withstand": "dayanmak, direnmek", "harsh": "sert, çetin", "frost": "don, ayaz", "apple": "elma"},
                ["apple", "cloze test", "vocabulary", "botany"]
            ),
            (
                23, "Cloze Test", "Edat (Preposition)", "Kolay",
                "Choose the word or phrase that best completes blank (23) in the passage above.",
                {"A": "for", "B": "by", "C": "with", "D": "under", "E": "about"},
                "A",
                "Cloze Test Taktiği: Amaç bildiren edat: 'bred solely for cosmetic appearance' (yalnızca kozmetik görünüm için yetiştirilen/üretilen). 'for' amaç anlamı katar.",
                "Cümle Çevirisi: 'Ticari tarım genişlediğinde, birçok yabani özellik yerini yalnızca kozmetik görünüm için melezlenen çeşitlere bıraktı.'",
                {"bred": "yetiştirilmiş, üretilmiş", "cosmetic": "kozmetik, yüzeysel", "appearance": "görünüş"},
                ["cloze test", "preposition"]
            ),
            (
                24, "Cloze Test", "Bağlaç (Sebep)", "Orta",
                "Choose the word or phrase that best completes blank (24) in the passage above.",
                {"A": "because", "B": "although", "C": "unless", "D": "whereas", "E": "even if"},
                "A",
                "Cloze Test Taktiği: Araştırmacıların atasal ormanlara dönme 'sebebi' anlatılıyor: '...because crop resistance has declined' (çünkü mahsul direnci sert bir şekilde düştü).",
                "Cümle Çevirisi: 'Bugün araştırmacılar bu atasal ormanlara geri dönüyorlar çünkü gelişen patojenler nedeniyle ürün direnci şiddetli şekilde düştü.'",
                {"decline": "düşmek, gerilemek", "pathogen": "hastalık yapıcı mikrop", "ancestral": "atasal"},
                ["cloze test", "conjunction", "cause"]
            ),
            (
                25, "Cloze Test", "Relative Pronoun", "Kolay",
                "Choose the word or phrase that best completes blank (25) in the passage above.",
                {"A": "that", "B": "whom", "C": "whose", "D": "where", "E": "what"},
                "A",
                "Cloze Test Taktiği: 'hardier fruit varieties' (daha dayanıklı meyve türleri) öznesi için sıfat cümleciği 'that' ile başlar.",
                "Cümle Çevirisi: 'Bilim insanları, düzensiz iklim dalgalanmalarına dayanabilecek daha dirençli meyve çeşitleri geliştirmeyi umuyorlar.'",
                {"endure": "katlanmak, dayanmak", "erratic": "düzensiz, tutarsız"},
                ["cloze test", "relative clause"]
            ),
            (
                26, "Cloze Test", "Edat (Preposition)", "Orta",
                "Choose the word or phrase that best completes blank (26) in the passage above.",
                {"A": "without", "B": "between", "C": "amid", "D": "during", "E": "beneath"},
                "A",
                "Cloze Test Taktiği: 'kimyasal tarım ilaçlarına bağımlı olmaksızın / olmadan' anlamı için olumsuzluk edatı 'without' gereklidir ('without reliance on...').",
                "Cümle Çevirisi: '...kimyasal böcek ilaçlarına bağımlı olmadan iklim dalgalanmalarına dayanabilen meyveler.'",
                {"reliance on": "bağımlılık, güven", "pesticide": "tarım ilacı"},
                ["cloze test", "preposition"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in cloze2_specs:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": cloze2_passage,
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 27-36: CÜMLE TAMAMLAMA (SENTENCE COMPLETION)
        # ==========================================
        sc_data = [
            (
                27, "Cümle Tamamlama", "Zıtlık Bağlacı", "Orta",
                "Although early civilizations lacked modern meteorological instruments, ------.",
                {
                    "A": "they developed remarkably accurate calendars by tracking astronomical movements",
                    "B": "they were completely helpless against even minor seasonal rainfalls",
                    "C": "agricultural yields remained permanently insufficient throughout the Bronze Age",
                    "D": "few records survived to inform contemporary historians about their methods",
                    "E": "most ancient crops were destroyed by sudden temperature variations"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'Although' ile başlayan yan cümlede olumsuz bir kısıtlama (teknolojik aletlerin olmaması -) varsa, ana cümlede bunu telafi eden olumlu bir başarı (+) beklenir. A şıkkında gök cisimlerini takip ederek isabetli takvimler geliştirdikleri belirtilmiştir.",
                "Cümle Çevirisi: 'Erken uygarlıklar modern meteorolojik aletlerden yoksun olmalarına rağmen, gök hareketlerini takip ederek son derece isabetli takvimler geliştirdiler.'",
                {"meteorological": "meteorolojik, hava durumuyla ilgili", "accurately": "isabetli şekilde", "astronomical": "astronomik"},
                ["sentence completion", "contrast", "history"]
            ),
            (
                28, "Cümle Tamamlama", "Sebep-Sonuç", "Orta",
                "Because bees and other wild insects pollinate over seventy percent of the world's staple food crops, ------.",
                {
                    "A": "their ongoing global population decline poses an alarming threat to human food security",
                    "B": "commercial honey production has become the primary source of agricultural income",
                    "C": "farmers have completely eliminated chemical fertilizers across industrialized nations",
                    "D": "most plant species can reproduce independently of external biological vectors",
                    "E": "artificial greenhouse environments are entirely immune to pest outbreaks"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'Because' arıcılığın ve tozlaşmanın gıdanın %70'ini oluşturduğu hayati önemini bildiriyor. Sonuç cümlesinde bu böceklerin yok olmasının insanlığın gıda güvenliğini tehdit ettiği (A şıkkı) doğrudan mantıksal sonuçtur.",
                "Cümle Çevirisi: 'Arılar ve diğer yabani böcekler dünyadaki temel gıda ürünlerinin yüzde yetmişinden fazlasını tozlaştırdığı için, onların süregelen küresel nüfus kaybı insan gıda güvenliğine yönelik korkutucu bir tehdit oluşturmaktadır.'",
                {"pollinate": "tozlaştırmak", "staple": "temel gıda", "alarming": "endişe verici, korkutucu"},
                ["sentence completion", "cause effect", "agriculture", "environment"]
            ),
            (
                29, "Cümle Tamamlama", "Zaman Cümlesi", "Orta",
                "Ever since satellite technology was first introduced to monitor polar ice caps, ------.",
                {
                    "A": "climatologists have documented accelerated rates of glacial melting with unprecedented precision",
                    "B": "temperatures in the Arctic have stabilized at pre-industrial levels",
                    "C": "oceanic currents ceased to influence global weather patterns altogether",
                    "D": "shipping routes across the Northern Sea were permanently abandoned by international fleets",
                    "E": "renewable wind turbines were decommissioned along coastal perimeters"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'Ever since + Past' kuralı ana cümlede 'Present Perfect Tense' (have documented) gerektirir. Anlamsal olarak uydular kutup buzullarını izlediğinden beri erime hızı kaydedilmektedir.",
                "Cümle Çevirisi: 'Kutup buzullarını izlemek için uydu teknolojisi ilk kez kullanılmaya başlandığından bu yana, iklimbilimciler buzul erimesindeki hızlanmayı benzeri görülmemiş bir hassasiyetle belgelemektedirler.'",
                {"glacial": "buzul", "precision": "hassasiyet, kesinlik", "climatologist": "iklimbilimci"},
                ["sentence completion", "time clause", "grammar", "climate"]
            ),
            (
                30, "Cümle Tamamlama", "Zıtlık (Whereas / While)", "Zor",
                "While renewable energy production has expanded substantially across Western economies, ------.",
                {
                    "A": "coal and natural gas still satisfy a predominant portion of global electricity demand",
                    "B": "solar panel manufacturing costs have plummeted to historic lows",
                    "C": "public support for sustainable conservation programs has reached an all-time high",
                    "D": "fossil fuel subsidies were completely dismantled by international treaties",
                    "E": "energy consumption in major metropolitan hubs has dropped to near zero"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'While' (iken / -e rağmen) zıtlık yapısıdır. Yenilenebilir enerji artarken (olumlu gelişme), kömür ve gazın hala küresel talebin çoğunu karşılaması (ters gerçek) mükemmel zıtlıktır.",
                "Cümle Çevirisi: 'Batı ekonomilerinde yenilenebilir enerji üretimi önemli ölçüde artarken, kömür ve doğal gaz küresel elektrik talebinin baskın bir kısmını karşılamaya devam etmektedir.'",
                {"substantially": "önemli ölçüde", "predominant": "baskın, en büyük", "demand": "talep"},
                ["sentence completion", "contrast", "energy", "economy"]
            ),
            (
                31, "Cümle Tamamlama", "Koşul Cümlesi (Unless)", "Orta",
                "Unless public health authorities act decisively to curb antimicrobial resistance, ------.",
                {
                    "A": "routine surgical procedures and minor infections could once again become life-threatening",
                    "B": "pharmaceutical companies will instantly synthesize flawless synthetic antibiotics",
                    "C": "bacterial strains will naturally evolve into harmless microbiological organisms",
                    "D": "hospital admission rates will fall dramatically over the next decade",
                    "E": "global healthcare expenditures will decline to unprecedented levels"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'Unless' (-medikçe / if not) olumsuz bir uyarıdır. Yetkililer antibiyotik direncine karşı harekete geçmedikçe, sıradan ameliyatlar bile ölümcül hale gelebilir (A şıkkı).",
                "Cümle Çevirisi: 'Halk sağlığı yetkilileri antimikrobiyal direnci engellemek için kararlı adımlar atmadıkça, rutin cerrahi müdahaleler ve küçük enfeksiyonlar yeniden hayati tehlike yaratır hale gelebilir.'",
                {"antimicrobial": "mikrop karşıtı", "curb": "dizginlemek, kontrol altına almak", "life-threatening": "hayati tehlike yaratan"},
                ["sentence completion", "condition", "health", "medicine"]
            ),
            (
                32, "Cümle Tamamlama", "Sebep (Since)", "Kolay",
                "Since consumer awareness regarding sustainable farming has risen sharply, ------.",
                {
                    "A": "major supermarket chains are dedicating more shelf space to organically grown fruits such as apples",
                    "B": "farmers have decided to quadruple the application of chemical fungicides",
                    "C": "the demand for locally sourced produce has plummeted across suburban regions",
                    "D": "organic certification standards have been completely revoked by governments",
                    "E": "consumers have completely ceased eating fresh horticultural products"
                },
                "A",
                "Cümle Tamamlama Taktiği: Tüketici bilinci arttığı için (sebep), süpermarketler organik elma gibi ürünlere daha çok yer açmaktadır (sonuç).",
                "Cümle Çevirisi: 'Sürdürülebilir tarıma yönelik tüketici bilinci hızla yükseldiği için, büyük süpermarket zincirleri organik olarak yetiştirilen elma gibi meyvelere reyonlarında daha fazla yer ayırmaktadır.'",
                {"awareness": "farkındalık, bilinç", "organically": "organik olarak", "apple": "elma"},
                ["apple", "sentence completion", "agriculture", "consumer"]
            ),
            (
                33, "Cümle Tamamlama", "Amaç (In order to)", "Orta",
                "In order to mitigate the destructive impact of urban heat islands during peak summer, ------.",
                {
                    "A": "city planners are integrating rooftop gardens and permeable pavement materials",
                    "B": "industrial factories are permitted to discharge hot cooling water into riverbeds",
                    "C": "municipalities have systematically paved over existing parklands and wetlands",
                    "D": "automotive manufacturers are phasing out electric vehicle architectures",
                    "E": "public transport networks are being replaced with private fossil fuel highways"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'In order to mitigate' (azaltmak / hafifletmek amacıyla) yapısı kentsel ısı adalarını düşürecek yeşil çatı ve geçirgen asfalt gibi çözümlere işaret eder (A şıkkı).",
                "Cümle Çevirisi: 'Yazın en sıcak dönemlerinde kentsel ısı adalarının yıkıcı etkisini hafifletmek amacıyla, şehir plancıları çatı bahçeleri ve geçirgen kaplama malzemelerini şehre entegre etmektedirler.'",
                {"mitigate": "hafifletmek, azaltmak", "permeable": "geçirgen", "rooftop": "çatı"},
                ["sentence completion", "purpose", "urban", "environment"]
            ),
            (
                34, "Cümle Tamamlama", "Zıtlık (In spite of)", "Zor",
                "In spite of experiencing prolonged periods of extreme economic volatility, ------.",
                {
                    "A": "the technology firm continued to invest heavily in artificial intelligence research",
                    "B": "the company was forced to declare immediate bankruptcy and liquidate all assets",
                    "C": "its chief executive officers resigned in disgrace after consecutive quarterly losses",
                    "D": "production facilities were shut down permanently across overseas territories",
                    "E": "shareholders refused to authorize any further research and development initiatives"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'In spite of' (-e rağmen) zıtlık katar. Ekonomik çalkantıya rağmen şirketin pes etmeyip yapay zeka araştırmalarına büyük yatırım yapmayı sürdürmesi (A şıkkı) tek zıtlıktır; diğer şıklar krizin doğrudan olumsuz sonuçlarıdır.",
                "Cümle Çevirisi: 'Uzun süreli aşırı ekonomik dalgalanma dönemleri yaşamasına rağmen, teknoloji firması yapay zeka araştırmalarına yoğun yatırım yapmayı sürdürdü.'",
                {"volatility": "oynaklık, dalgalanma", "prolonged": "uzun süreli", "invest": "yatırım yapmak"},
                ["sentence completion", "contrast", "technology", "business"]
            ),
            (
                35, "Cümle Tamamlama", "Karşılaştırma (Just as... so...)", "Zor",
                "Just as physical exercise strengthens muscles and boosts cardiovascular resilience, ------.",
                {
                    "A": "so cognitive learning activities fortify neural connections and delay age-related cognitive decline",
                    "B": "so excessive emotional stress damages arterial vessels throughout the human body",
                    "C": "so sedentary habits promote insulin resistance and chronic obesity",
                    "D": "neither dietary supplements nor vitamins can replace restful sleep",
                    "E": "either balanced hydration or proper stretching protects against joint inflammation"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'Just as ... so ...' (Tıpkı ... olduğu gibi, ... de öyledir) benzerlik/analoji kurar. Egzersizin kasları güçlendirdiği gibi, zihinsel faaliyetlerin de sinirleri güçlendirmesi paraleldir.",
                "Cümle Çevirisi: 'Tıpkı fiziksel egzersizin kasları güçlendirip kalp-damar dayanıklılığını artırdığı gibi, bilişsel öğrenme etkinlikleri de sinirsel bağlantıları tahkim eder ve yaşa bağlı zihinsel gerilemeyi geciktirir.'",
                {"fortify": "güçlendirmek, tahkim etmek", "cardiovascular": "kalp-damar", "resilience": "dayanıklılık"},
                ["sentence completion", "analogy", "health", "psychology"]
            ),
            (
                36, "Cümle Tamamlama", "Zaman (Once)", "Orta",
                "Once deep-sea explorers map the uncharted topography of hydrothermal vents, ------.",
                {
                    "A": "marine biologists will be better equipped to comprehend unique microbial ecosystems thriving in darkness",
                    "B": "commercial mining vessels had already extracted precious rare-earth minerals",
                    "C": "ocean water temperatures dropped below freezing across equatorial trenches",
                    "D": "submersible probes were completely destroyed by immense hydrostatic pressure",
                    "E": "surface currents ceased to deliver oxygen to benthic organism colonies"
                },
                "A",
                "Cümle Tamamlama Taktiği: 'Once + Present' (zaman bağlacı: ...-dığı zaman / -er ermez), ana cümlede Future Tense (will be better equipped) gerektirir.",
                "Cümle Çevirisi: 'Derin deniz kaşifleri hidrotermal bacaların haritalanmamış topografyasını çıkardıklarında, deniz biyologları karanlıkta gelişen eşsiz mikrobiyal ekosistemleri anlamak için daha donanımlı olacaklardır.'",
                {"uncharted": "haritası çıkarılmamış, bilinmeyen", "hydrothermal": "hidrotermal, sıcak su", "thrive": "gelişmek, serpilmek"},
                ["sentence completion", "time clause", "marine", "science"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in sc_data:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": "",
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 37-42: ÇEVİRİ (TRANSLATION - 3 ENG->TR, 3 TR->ENG)
        # ==========================================
        trans_specs = generate_authentic_translations.get_authentic_translations_for_year(year)

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in trans_specs:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": "",
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 43-62: OKUMA PARÇALARI (5 METİN X 4 SORU)
        # ==========================================
        p1_text = (
            "Wild apple forests nestled in the Tian Shan mountains of Central Asia are widely recognized as the genetic birthplace of all modern domestic apples. "
            "For centuries, these wild populations endured extreme temperature fluctuations, rampant fungal blights, and relentless insect attacks without human intervention. "
            "As a consequence of natural selection, these wild trees accumulated an extraordinary reservoir of disease-resistant genes. "
            "In recent decades, however, urban encroachment and commercial monoculture farming have placed these ancestral woodlands under severe threat. "
            "Agricultural scientists are now urgently cataloging seed specimens from these remote valleys because commercial apple varieties have become dangerously uniform. "
            "Without the genetic variability preserved in wild relatives, commercial orchards worldwide remain exceptionally vulnerable to emerging catastrophic plant diseases."
        )

        p1_questions = [
            (
                43, "Okuma Parçası", "Ana Fikir", "Orta",
                "It is clearly stated in the passage that the wild apple forests of Central Asia ------.",
                {
                    "A": "possess vital genetic diversity crucial for protecting modern commercial apples from diseases",
                    "B": "were originally planted by early nomadic tribes who practiced selective breeding",
                    "C": "are completely immune to all known forms of human encroachment and logging",
                    "D": "have recently surpassed commercial orchards in total global fruit output",
                    "E": "contain fewer disease-resistant traits than commercially cultivated apple trees"
                },
                "A",
                "Paragraf Ana Fikir Taktiği: Metnin ana tezi son ve ilk cümlelerde özetlenmiştir: Yabani ormanlar modern elmaların genetik atasıdır ve hastalıklara karşı elzem genetik çeşitlilik taşırlar.",
                "Metinde açıkça belirtilmiştir ki, yabani elma ormanları modern elmaların hastalıklara karşı korunması için hayati genetik çeşitliliği barındırmaktadır (A seçeneği).",
                {"reservoir": "hazne, depo", "encroachment": "istila, tecavüz", "vulnerable": "savunmasız", "apple": "elma"},
                ["apple", "reading", "main idea", "biology"]
            ),
            (
                44, "Okuma Parçası", "Doğrudan Çıkarım", "Orta",
                "According to the passage, wild apple populations developed strong disease resistance because ------.",
                {
                    "A": "they survived rigorous natural selection under harsh environmental pressures over centuries",
                    "B": "farmers applied traditional organic fertilizers throughout the mountains",
                    "C": "they were shielded from insects by protective high mountain barriers",
                    "D": "commercial orchard managers regularly introduced modern synthetic pesticides",
                    "E": "they cross-pollinated exclusively with domestic Mediterranean fruit trees"
                },
                "A",
                "Paragraf Detay Taktiği: 'As a consequence of natural selection, these wild trees accumulated...' ifadesi A şıkkında 'survived rigorous natural selection under harsh environmental pressures' olarak eşanlamlı (paraphrased) verilmiştir.",
                "Doğru cevap A'dır: 'yüzyıllar boyunca çetin çevre koşulları altında doğal seçilimden geçerek hayatta kaldıkları için'.",
                {"rigorous": "sıkı, zorlu", "accumulate": "biriktirmek", "consequence": "sonuç"},
                ["apple", "reading", "detail"]
            ),
            (
                45, "Okuma Parçası", "Yazarın Uyarısı", "Zor",
                "The author warns that modern commercial apple orchards are at risk primarily due to ------.",
                {
                    "A": "their dangerous lack of genetic variability caused by uniform commercial breeding",
                    "B": "excessive rainfall in traditional fruit-producing regions across Europe",
                    "C": "declining international consumer demand for organic fresh produce",
                    "D": "competition from newly introduced tropical synthetic fruits",
                    "E": "the total extinction of all insect pollinators in mountain regions"
                },
                "A",
                "Paragraf Taktiği: Metnin son cümlesine dikkat: 'Without the genetic variability preserved in wild relatives, commercial orchards worldwide remain exceptionally vulnerable...'. Bu tehlike A şıkkındaki 'lack of genetic variability' ifadesiyle birebir örtüşür.",
                "Doğru cevap A'dır: Ticari yetiştiriciliğin yarattığı tehlikeli genetik tekdüzelik ve çeşitlilik eksikliği.",
                {"uniform": "tekdüze, standart", "variability": "çeşitlilik", "vulnerable": "savunmasız"},
                ["apple", "reading", "inference"]
            ),
            (
                46, "Okuma Parçası", "Kelime Anlamı", "Kolay",
                "The word 'encroachment' in line 4 is closest in meaning to ------.",
                {
                    "A": "intrusion", "B": "rejuvenation", "C": "legislation", "D": "admiration", "E": "reconstruction"
                },
                "A",
                "Kelime Sorusu Taktiği: 'Urban encroachment' = kentsel yayılma / istila / doğal alana izinsiz sokulma. 'Intrusion' (izinsiz giriş, müdahale, istila) en yakın anlamlısıdır.",
                "'encroachment' sınır aşımı, izinsiz yayılma, işgal anlamına gelir. 'intrusion' kelimesiyle birebir eşanlamlıdır.",
                {"encroachment": "istila, sınır aşımı", "intrusion": "izinsiz giriş, işgal"},
                ["reading", "vocabulary in context"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in p1_questions:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": p1_text,
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        p2_text = (
            "The integration of generative artificial intelligence into professional workplaces is reshaping traditional concepts of labor and creativity. "
            "Proponents assert that autonomous algorithms relieve knowledge workers from mundane administrative burdens, liberating them to pursue higher-order strategic thinking. "
            "However, critics caution that cognitive deskilling may emerge if professionals rely excessively on synthetic outputs without exercising critical judgment. "
            "In fields such as software engineering, law, and medical diagnosis, AI models routinely generate coherent initial drafts, yet human verification remains indispensable. "
            "Organizations that thrive in this technological transition will likely be those that foster symbiotic collaboration between human intuition and machine intelligence."
        )

        p2_questions = [
            (
                47, "Okuma Parçası", "Ana Fikir", "Orta",
                "The primary purpose of the passage is to ------.",
                {
                    "A": "discuss both the advantages and potential risks of integrating AI into professional workflows",
                    "B": "advocate for the complete prohibition of generative algorithms in medical institutions",
                    "C": "prove that human intuition has been rendered obsolete by advanced computational systems",
                    "D": "criticize software developers for relying on outdated programming architectures",
                    "E": "demonstrate that corporate profitability depends solely on eliminating human workers"
                },
                "A",
                "Ana Fikir Taktiği: Metin hem avantajları (rutin işlerden kurtulma) hem de riskleri (bilişsel yetenek kaybı) dengeli şekilde ele almaktadır. A şıkkı 'discuss both the advantages and potential risks' bu sentezi verir.",
                "Doğru cevap A'dır: Yapay zekanın iş akışlarına dahil edilmesinin hem faydalarını hem de olası risklerini tartışmak.",
                {"proponent": "savunucu", "deskilling": "yetenek kaybı", "symbiotic": "ortak yaşam, simbiyotik"},
                ["reading", "main idea", "ai", "technology"]
            ),
            (
                48, "Okuma Parçası", "Detay", "Orta",
                "According to the passage, advocates of generative AI argue that the technology ------.",
                {
                    "A": "frees knowledge workers from repetitive chores, enabling them to focus on strategic initiatives",
                    "B": "entirely replaces the necessity for human oversight in criminal courts",
                    "C": "guarantees error-free automated medical diagnoses without laboratory testing",
                    "D": "diminishes the need for higher education among younger generations",
                    "E": "automatically eliminates all administrative costs within corporations"
                },
                "A",
                "Detay Taktiği: Metindeki 'relieve knowledge workers from mundane administrative burdens, liberating them to pursue higher-order strategic thinking' ifadesi A şıkkında eşanlamlılarla verilmiştir.",
                "Doğru cevap A'dır: Bilgi işçilerini rutin işlerden kurtarıp stratejik girişimlere odaklanmalarını sağlar.",
                {"mundane": "sıradan, rutin", "administrative": "idari", "liberate": "özgür kılmak"},
                ["reading", "detail", "technology"]
            ),
            (
                49, "Okuma Parçası", "Yazar Görüşü", "Zor",
                "The author implies that successful organizations in the modern era will be those that ------.",
                {
                    "A": "establish productive partnerships blending human cognitive insights with artificial intelligence",
                    "B": "resist adopting synthetic algorithms to preserve traditional artisan craftsmanship",
                    "C": "replace their entire human executive boards with autonomous decision systems",
                    "D": "prohibit their employees from using computational tools during business hours",
                    "E": "focus exclusively on reducing payroll expenditures through full automation"
                },
                "A",
                "Çıkarım Taktiği: Son cümledeki 'foster symbiotic collaboration between human intuition and machine intelligence' ifadesi A şıkkında 'blending human cognitive insights with artificial intelligence' olarak sunulmuştur.",
                "Doğru cevap A'dır: İnsan zekası ve sezgisi ile yapay zekayı harmanlayan üretken ortaklıklar kuran şirketler.",
                {"symbiotic": "simbiyotik, karşılıklı fayda sağlayan", "intuition": "sezgi", "blend": "harmanlamak"},
                ["reading", "inference", "business"]
            ),
            (
                50, "Okuma Parçası", "Kelime Anlamı", "Kolay",
                "The word 'mundane' in the passage is closest in meaning to ------.",
                {
                    "A": "routine", "B": "extraordinary", "C": "inspirational", "D": "hazardous", "E": "prestigious"
                },
                "A",
                "Kelime Sorusu Taktiği: 'mundane administrative burdens' = sıradan, tekdüze, rutin idari yükler. 'Routine' en uygun eşanlamlıdır.",
                "'mundane' dünyevi, sıradan, rutin anlamına gelir. 'routine' kelimesiyle birebir örtüşür.",
                {"mundane": "sıradan, tekdüze", "routine": "rutin"},
                ["reading", "vocabulary in context"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in p2_questions:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": p2_text,
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        p3_text = (
            "During non-rapid eye movement (NREM) sleep, the human brain initiates an intricate cellular waste-clearing mechanism known as the glymphatic system. "
            "Cerebrospinal fluid surges through brain tissue at nearly double its waking speed, flushing out toxic metabolic byproducts including beta-amyloid proteins. "
            "Neurobiologists have long recognized that the chronic accumulation of these proteins correlates strongly with Alzheimer's disease and cognitive impairment. "
            "Consequently, sleep is no longer viewed by medicine as an inactive period of biological downtime, but rather as an aggressive neuroprotective maintenance process. "
            "Individuals who consistently curtail their sleep duration below six hours effectively deprive their central nervous system of this essential biological cleansing."
        )

        p3_questions = [
            (
                51, "Okuma Parçası", "Ana Fikir", "Orta",
                "According to the passage, the glymphatic system serves to ------.",
                {
                    "A": "cleanse the brain of toxic metabolic waste by surging cerebrospinal fluid during deep sleep",
                    "B": "accelerate memory loss by dismantling synaptic links formed during wakefulness",
                    "C": "stimulate the conscious motor cortex to keep muscles active during nighttime",
                    "D": "produce excess beta-amyloid proteins to shield neurons from high temperatures",
                    "E": "reduce the body's core temperature to induce prolonged periods of paralysis"
                },
                "A",
                "Detay Taktiği: İlk iki cümlede lenfatik sistemin uykuda beyin omurilik sıvısı ile toksik maddeleri temizlediği açıkça anlatılmıştır (A şıkkı).",
                "Doğru cevap A'dır: Derin uyku sırasında beyin omurilik sıvısını artırarak beyni toksik metabolik atıklardan arındırmak.",
                {"cerebrospinal": "beyin omurilik", "metabolic": "metabolik", "flush out": "yıkayıp temizlemek"},
                ["reading", "detail", "health", "neuroscience"]
            ),
            (
                52, "Okuma Parçası", "Çıkarım", "Zor",
                "It can be inferred from the passage that chronic sleep deprivation ------.",
                {
                    "A": "elevates long-term vulnerability to neurodegenerative conditions like Alzheimer's",
                    "B": "permanently halts the circulation of cerebrospinal fluid throughout the spinal cord",
                    "C": "causes an instantaneous cure for cognitive fatigue and stress disorders",
                    "D": "enhances the efficiency of metabolic protein clearing during waking hours",
                    "E": "converts beta-amyloid proteins into beneficial neurotransmitter compounds"
                },
                "A",
                "Çıkarım Taktiği: Metin, toksinlerin atılamamasının Alzheimer ile güçlü ilişkili olduğunu ve uykusuzluğun bu temizliği engellediğini söylüyor. Buradan A şıkkı (Alzheimer gibi hastalıklara yatkınlığı artırması) doğrudan çıkarılır.",
                "Doğru cevap A'dır: Uzun vadede Alzheimer gibi nörodejeneratif hastalıklara karşı savunmasızlığı artırır.",
                {"vulnerability": "savunmasızlık", "neurodegenerative": "sinir yıkıcı", "deprivation": "yoksunluk"},
                ["reading", "inference", "health"]
            ),
            (
                53, "Okuma Parçası", "Yazar Tutumu", "Orta",
                "Modern medicine's evolving perspective on sleep is described as shifting from ------.",
                {
                    "A": "regarding it as passive inactivity to recognizing it as an active neuroprotective mechanism",
                    "B": "encouraging minimal sleep to demanding more than ten hours of rest daily",
                    "C": "relying entirely on pharmaceutical sedatives to abandoning all medical sleep interventions",
                    "D": "attributing dreams to physical illnesses to treating nightmares with psychiatric surgery",
                    "E": "viewing sleep as purely psychological to dismissing its biological relevance"
                },
                "A",
                "Paragraf Karşılaştırma Taktiği: 'no longer viewed as an inactive downtime, but rather as an aggressive neuroprotective maintenance process' ifadesi tam olarak A seçeneğidir.",
                "Doğru cevap A'dır: Uyku pasif bir hareketsizlikten aktif bir sinir koruyucu bakım sürecine dönüşen bir bakış açısıyla tanımlanmaktadır.",
                {"downtime": "duraklama, atıl süre", "neuroprotective": "sinir koruyucu", "perspective": "bakış açısı"},
                ["reading", "comparison"]
            ),
            (
                54, "Okuma Parçası", "Kelime Anlamı", "Kolay",
                "The word 'curtail' in the final sentence is closest in meaning to ------.",
                {
                    "A": "shorten", "B": "prolong", "C": "investigate", "D": "celebrate", "E": "replicate"
                },
                "A",
                "Kelime Anlamı Taktiği: 'curtail their sleep duration below six hours' = uykusunu altı saatin altına kısmak/kısaltmak. 'Shorten' (kısaltmak) tam karşılığıdır.",
                "'curtail' kısmak, azaltmak, kısaltmak demektir. 'shorten' en doğru eşanlamlıdır.",
                {"curtail": "kısmak, kısaltmak", "shorten": "kısaltmak"},
                ["reading", "vocabulary in context"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in p3_questions:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": p3_text,
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        p4_text = (
            "The Atlantic Meridional Overturning Circulation (AMOC) functions as a massive oceanic conveyor belt, transporting warm tropical waters northward and returning cold deep water south. "
            "This marine circulation plays a profound role in moderating the climate of Western Europe, ensuring temperate winters compared to Canadian latitudes at similar geographic positions. "
            "However, unprecedented freshwater runoff from melting Greenland ice sheets is diluting North Atlantic surface salinity. "
            "Because fresh water is less dense than saltwater, this dilution inhibits surface water from sinking, which threatens to stall the entire circulation mechanism. "
            "Paleoclimate simulations suggest that a substantial deceleration of AMOC could trigger abrupt shifts in tropical monsoon belts and intensify severe storm systems globally."
        )

        p4_questions = [
            (
                55, "Okuma Parçası", "Detay", "Orta",
                "It is stated in the passage that the AMOC is essential for Western Europe because it ------.",
                {
                    "A": "keeps winter temperatures significantly milder than other regions at equivalent latitudes",
                    "B": "provides the continent with infinite reserves of desalinated drinking water",
                    "C": "prevents all tropical hurricanes from reaching the Mediterranean coastline",
                    "D": "cools the North Sea sufficiently to sustain commercial fishing fleets year-round",
                    "E": "permanently halts the evaporation of moisture into coastal cloud systems"
                },
                "A",
                "Detay Taktiği: Metindeki 'moderating the climate of Western Europe, ensuring temperate winters compared to Canadian latitudes at similar geographic positions' ifadesi A şıkkında 'keeps winter temperatures milder' şeklinde verilmiştir.",
                "Doğru cevap A'dır: Kış sıcaklıklarını aynı enlemdeki diğer bölgelere kıyasla belirgin şekilde daha ılıman tutar.",
                {"temperate": "ılıman", "latitude": "enlem", "circulation": "dolaşım, akıntı"},
                ["reading", "detail", "oceanography", "geography"]
            ),
            (
                56, "Okuma Parçası", "Sebep-Sonuç", "Zor",
                "The primary reason why melting Greenland ice threatens the oceanic circulation is that ------.",
                {
                    "A": "the influx of lighter freshwater reduces salinity and impedes cold water from sinking",
                    "B": "submerged icebergs physically block the narrow straits between Norway and Iceland",
                    "C": "the cold ice drastically increases ocean salinity, causing heavy waters to submerge too rapidly",
                    "D": "meltwater discharges contain industrial pollutants that destroy marine plankton",
                    "E": "rising sea levels cause tropical waters to evaporate before reaching the northern hemisphere"
                },
                "A",
                "Sebep-Sonuç Taktiği: Metin: 'Because fresh water is less dense than saltwater, this dilution inhibits surface water from sinking'. A şıkkı bunu 'reduces salinity and impedes cold water from sinking' olarak ifade eder.",
                "Doğru cevap A'dır: Eriyen tatlı suyun tuzluluğu düşürerek soğuk suyun batmasını engellemesi.",
                {"salinity": "tuzluluk", "impede": "engellemek", "dense": "yoğun"},
                ["reading", "cause effect", "climate"]
            ),
            (
                57, "Okuma Parçası", "Sonuç / Çıkarım", "Orta",
                "According to paleoclimate models, if the AMOC slows down considerably, ------.",
                {
                    "A": "worldwide weather disruptions, including altered monsoon patterns, could ensue abruptly",
                    "B": "global sea levels would immediately recede to Ice Age baselines",
                    "C": "all freshwater lakes in North America would evaporate within decades",
                    "D": "temperatures in Northern Europe would surge to subtropical averages",
                    "E": "monsoon rains would cease entirely across the South American continent"
                },
                "A",
                "Sonuç Taktiği: Son cümleye bakın: 'a substantial deceleration of AMOC could trigger abrupt shifts in tropical monsoon belts and intensify severe storm systems globally.' A şıkkı bu küresel hava bozulmalarını özetler.",
                "Doğru cevap A'dır: Muson yağışlarının değişmesi de dahil küresel hava anomalileri aniden ortaya çıkabilir.",
                {"deceleration": "yavaşlama", "abrupt": "ani", "monsoon": "muson"},
                ["reading", "inference", "climate"]
            ),
            (
                58, "Okuma Parçası", "Kelime Anlamı", "Kolay",
                "The word 'deceleration' in the final sentence is closest in meaning to ------.",
                {
                    "A": "slowing down", "B": "expansion", "C": "enhancement", "D": "purification", "E": "freezing"
                },
                "A",
                "Kelime Sorusu Taktiği: 'deceleration' (ivme kaybı, yavaşlama) kelimesinin doğrudan eşanlamlısı 'slowing down'dır.",
                "'deceleration' yavaşlama demektir. 'slowing down' doğru cevaptır.",
                {"deceleration": "yavaşlama", "slowing down": "yavaşlama"},
                ["reading", "vocabulary in context"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in p4_questions:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": p4_text,
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        p5_text = (
            "Linguists estimate that roughly half of the world's approximately 7,000 spoken languages may disappear before the end of the twenty-first century. "
            "When an indigenous language becomes extinct, humanity loses far more than an arbitrary collection of grammatical rules and phonetic symbols. "
            "Embedded within indigenous vocabularies are vast encyclopedias of ethnobotanical knowledge, detailing medicinal properties of rare plants and ancestral ecological stewardship. "
            "Linguistic assimilation driven by globalized telecommunications and centralized school curricula accelerates the transition of younger generations toward dominant national tongues. "
            "Digital archiving initiatives and community-led revitalization programs represent the most promising safeguards to preserve these fragile cultural archives for posterity."
        )

        p5_questions = [
            (
                59, "Okuma Parçası", "Ana Fikir", "Orta",
                "The author emphasizes that the loss of an indigenous language is tragic because ------.",
                {
                    "A": "it erases irreplaceable botanical, ecological, and cultural knowledge stored within its lexicon",
                    "B": "it renders children completely unable to master dominant international languages",
                    "C": "it immediately triggers violent regional political unrest among rural communities",
                    "D": "it forces linguists to abandon all theoretical grammar documentation projects",
                    "E": "it leads to the simultaneous loss of mineral wealth across indigenous territories"
                },
                "A",
                "Ana Fikir Taktiği: Metin 'humanity loses far more than an arbitrary collection of words... vast encyclopedias of ethnobotanical knowledge' diyerek dilin kaybıyla benzersiz botanik ve ekolojik bilginin yok olduğunu vurgular (A şıkkı).",
                "Doğru cevap A'dır: Kelime hazinesinde saklı olan yeri doldurulamaz botanik, ekolojik ve kültürel birikimi yok etmesi.",
                {"lexicon": "söz varlığı, sözlük", "ethnobotanical": "etnobotanik", "irreplaceable": "yeri doldurulamaz"},
                ["reading", "main idea", "linguistics"]
            ),
            (
                60, "Okuma Parçası", "Detay", "Orta",
                "According to the passage, linguistic assimilation is accelerated by ------.",
                {
                    "A": "centralized educational curricula and pervasive digital telecommunications",
                    "B": "the complete absence of writing systems in indigenous villages",
                    "C": "excessive funding directed toward local cultural festivals",
                    "D": "the refusal of elderly native speakers to teach younger family members",
                    "E": "strict international laws prohibiting the publication of minority books"
                },
                "A",
                "Detay Taktiği: 'Linguistic assimilation driven by globalized telecommunications and centralized school curricula...' cümlesi doğrudan A şıkkına denk gelir.",
                "Doğru cevap A'dır: Merkezi müfredatlar ve yaygın dijital telekomünikasyon.",
                {"assimilation": "asimilasyon, benzeşme", "pervasive": "yaygın, her yere sinen"},
                ["reading", "detail", "linguistics"]
            ),
            (
                61, "Okuma Parçası", "Çözüm Önerisi", "Orta",
                "The passage suggests that the most effective way to safeguard endangered languages is through ------.",
                {
                    "A": "digital preservation efforts paired with community-driven language revival initiatives",
                    "B": "imposing financial penalties on parents who teach children global languages",
                    "C": "isolating indigenous tribes from all external internet connections and media",
                    "D": "forcing state universities to replace English programs with ancient tribal dialects",
                    "E": "restricting international travel to regions where native languages are spoken"
                },
                "A",
                "Çözüm Taktiği: Son cümleye bakın: 'Digital archiving initiatives and community-led revitalization programs represent the most promising safeguards...'. A şıkkı bu ifadeyi doğrudan karşılar.",
                "Doğru cevap A'dır: Dijital arşivleme ve topluluk öncülüğünde canlandırma programları.",
                {"safeguard": "koruma önlemi", "revitalization": "yeniden canlandırma"},
                ["reading", "solution", "culture"]
            ),
            (
                62, "Okuma Parçası", "Kelime Anlamı", "Kolay",
                "The word 'posterity' in the final sentence is closest in meaning to ------.",
                {
                    "A": "future generations", "B": "ancient ancestors", "C": "wealthy donors", "D": "political leaders", "E": "foreign tourists"
                },
                "A",
                "Kelime Sorusu Taktiği: 'for posterity' = gelecek nesiller için, gelecek kuşaklar için. 'Future generations' doğrudan karşılığıdır.",
                "'posterity' gelecek nesiller, ahfad demektir. 'future generations' doğru eşanlamlıdır.",
                {"posterity": "gelecek nesiller", "future generations": "gelecek nesiller"},
                ["reading", "vocabulary in context"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in p5_questions:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": p5_text,
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 63-67: DİYALOG TAMAMLAMA
        # ==========================================
        dialogues = [
            (
                63, "Diyalog Tamamlama", "Akademik Diyalog", "Orta",
                "Professor Aris: Our department is considering replacing traditional textbooks with interactive AI tutoring software next semester.\n\nDr. Linda: ------\n\nProfessor Aris: That's a valid concern, but the software only provides scaffolding; teachers will still conduct all live evaluations and lectures.",
                {
                    "A": "Aren't you worried that students might become overly reliant on automated answers and lose critical thinking skills?",
                    "B": "I completely agree, textbooks are far too expensive for low-income undergraduate students nowadays.",
                    "C": "Which software development firm offered the lowest bid for building the database infrastructure?",
                    "D": "Did the dean approve our departmental travel budget for the upcoming educational symposium?",
                    "E": "Students will certainly score much higher on their final standardized exams with this software."
                },
                "A",
                "Diyalog Taktiği: Profesörün yanıtına bakın: 'That's a valid concern, but the software only provides scaffolding...' (Bu haklı bir endişe, ancak yazılım sadece destek sağlıyor...). Boşlukta olumsuz bir 'endişe/risk' dile getirilmiş olmalıdır. A şıkkı öğrencilerin aşırı bağımlı olma endişesini dile getirmektedir.",
                "Cümle Çevirisi: Dr. Linda haklı bir endişe öne sürmelidir ('Öğrencilerin otomatik cevaplara aşırı bağımlı hale gelip eleştirel düşünme becerilerini kaybetmelerinden endişelenmiyor musunuz?'). Profesör de 'Bu haklı bir endişe ancak...' diyerek yanıtlamıştır.",
                {"scaffolding": "destek, iskele", "reliant": "bağımlı", "evaluation": "değerlendirme"},
                ["dialogue", "education", "technology"]
            ),
            (
                64, "Diyalog Tamamlama", "Çevre & Ziraat Diyaloğu", "Orta",
                "Farmer Tom: I've noticed that wild apple trees growing near the forest boundary never get infected with fungal scab, while my commercial orchard suffers every spring.\n\nAgronomist Sarah: ------\n\nFarmer Tom: Exactly. That explains why researchers are so eager to crossbreed those wild varieties into our commercial stock.",
                {
                    "A": "That's because centuries of natural selection have endowed wild strains with robust multi-gene resistance that commercial monocultures lack.",
                    "B": "You should spray your orchard with more concentrated synthetic fungicides twice a week.",
                    "C": "Commercial apples taste much sweeter because they contain higher fructose concentrations.",
                    "D": "Forest soil is usually too acidic for domestic fruit trees to thrive properly.",
                    "E": "You probably forgot to irrigate the southern perimeter of your farm during last year's drought."
                },
                "A",
                "Diyalog Taktiği: Tom'un 'Exactly. That explains why researchers are so eager to crossbreed...' (Aynen öyle. Bu, araştırmacıların neden o yabani çeşitleri melezlemeye bu kadar hevesli olduğunu açıklıyor) tepkisi, Sarah'nın yabani ağaçların genetik üstünlüğünü açıklamış olmasını gerektirir (A şıkkı).",
                "Cümle Çevirisi: Agronomist Sarah: 'Çünkü yüzyıllardır süren doğal seçilim yabani türleri, ticari tek tip ürünlerde bulunmayan çok genli güçlü bir dirençle donatmıştır.' Tom: 'Aynen öyle...' diyerek bunu onaylar.",
                {"endow": "donatmak, bahşetmek", "scab": "kabuk bağlama, bitki uyuzu", "crossbreed": "melezlemek", "apple": "elma"},
                ["apple", "dialogue", "agriculture"]
            ),
            (
                65, "Diyalog Tamamlama", "Tıp & Sağlık Diyaloğu", "Orta",
                "Patient: Doctor, is it true that drinking black coffee before exercising burns substantially more fat?\n\nDoctor: Caffeine can slightly elevate your resting metabolic rate and increase alertness, but ------\n\nPatient: So it's not a magical shortcut after all; sustainable diet and consistent training are what really matter.",
                {
                    "A": "it cannot substitute for a caloric deficit and regular physical activity when it comes to meaningful weight management.",
                    "B": "you should consume at least six espressos every morning to observe any noticeable transformation.",
                    "C": "coffee completely prevents muscles from absorbing essential carbohydrates after workout sessions.",
                    "D": "cardiovascular training has been discredited by modern sports medicine as ineffective.",
                    "E": "energy drinks are proven to be much safer than freshly brewed natural coffee beans."
                },
                "A",
                "Diyalog Taktiği: Hastanın son cümlesindeki 'So it's not a magical shortcut after all; sustainable diet and consistent training are what really matter' (Demek ki sihirli bir kestirme yol değilmiş; asıl önemli olan sürdürülebilir diyet ve düzenli antrenmanmış) çıkarımı, doktorun kahvenin tek başına kalori açığı ve egzersizin yerini tutamayacağını söylediğini gösterir (A şıkkı).",
                "Cümle Çevirisi: Doktor: '...fakat anlamlı bir kilo yönetiminde kalori açığının ve düzenli fiziksel aktivitenin yerini tutamaz.' Hasta: 'Demek ki sihirli bir kestirme yol değilmiş...' der.",
                {"substitute": "yerini tutmak", "caloric deficit": "kalori açığı", "sustainable": "sürdürülebilir"},
                ["dialogue", "health", "nutrition"]
            ),
            (
                66, "Diyalog Tamamlama", "Ekonomi Diyaloğu", "Zor",
                "Financial Analyst: Several emerging economies are pegging their local currencies to gold reserves rather than foreign fiat currencies.\n\nEconomist: ------\n\nFinancial Analyst: You have a point. If global gold mining declines or reserves are frozen, liquidity could vanish overnight.",
                {
                    "A": "While that might curb inflation temporarily, it severely constrains a central bank's ability to stimulate the economy during deep recessions.",
                    "B": "Gold has historically been the only reliable medium of financial exchange without any inherent drawbacks.",
                    "C": "Investors never purchase precious metals when central bank interest rates are trending downwards.",
                    "D": "Digital cryptocurrencies will soon eliminate the necessity for both physical gold and paper cash.",
                    "E": "Commercial banks prefer holding foreign sovereign bonds because they carry zero market volatility."
                },
                "A",
                "Diyalog Taktiği: Analistin 'You have a point. If gold declines, liquidity could vanish...' (Haklı bir noktanız var, likidite bir gecede yok olabilir) cevabı, Ekonomistin altın standardının kısıtlayıcı tehlikelerinden bahsettiğini gösterir (A şıkkı).",
                "Cümle Çevirisi: Ekonomist: 'Bu durum enflasyonu geçici olarak dizginlese de, derin durgunluklarda merkez bankasının ekonomiyi canlandırma yeteneğini ciddi şekilde kısıtlar.'",
                {"constrain": "kısıtlamak", "liquidity": "likidite, nakit akışı", "recession": "durgunluk"},
                ["dialogue", "economics"]
            ),
            (
                67, "Diyalog Tamamlama", "Mimarlık & Şehircilik", "Kolay",
                "Architect Dan: We plan to replace all concrete plazas in the new downtown project with bioswales and permeable greenery.\n\nDeveloper Clara: Won't that substantially increase the initial construction budget?\n\nArchitect Dan: ------\n\nDeveloper Clara: I see. So the upfront expense pays for itself through disaster mitigation.",
                {
                    "A": "Yes, but it eliminates the need for expensive underground stormwater drainage pipes and prevents flash flooding damage.",
                    "B": "Not at all, synthetic grass and plastic pavers are much cheaper than ordinary ready-mix concrete.",
                    "C": "Downtown commuters rarely spend leisure time outdoors in landscaped public parks anyway.",
                    "D": "We haven't calculated the structural engineering costs yet because permits are pending.",
                    "E": "Green building certifications do not offer any tax incentives in this municipality."
                },
                "A",
                "Diyalog Taktiği: Clara'nın son sözü: 'I see. So the upfront expense pays for itself through disaster mitigation' (Anlıyorum, yani peşin maliyet felaketi önleme sayesinde kendi kendini amorti ediyor). Demek ki Dan ilk maliyetin pahalı olduğunu ama sel gibi büyük masrafları önlediğini söylemiştir (A şıkkı).",
                "Cümle Çevirisi: Dan: 'Evet artırır, ancak pahalı yer altı yağmur suyu drenaj borularına olan ihtiyacı ortadan kaldırır ve ani sel hasarlarını önler.' Clara: 'Anlıyorum, peşin masraf kendini amorti ediyor.'",
                {"bioswale": "biyo-hendek, yeşil su kanalı", "permeable": "geçirgen", "drainage": "drenaj"},
                ["dialogue", "urban", "architecture"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in dialogues:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": "",
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 68-71: ANLAMCA EN YAKIN CÜMLE (RESTATEMENT)
        # ==========================================
        restatements = [
            (
                68, "Anlamca En Yakın Cümle", "Zıtlık / Karşılaştırma", "Zor",
                "Had environmental scientists not persistently warned international bodies about the depletion of the ozone layer, the Montreal Protocol would never have been signed in 1987.",
                {
                    "A": "The Montreal Protocol of 1987 was ratified precisely because environmental scientists maintained relentless warnings regarding ozone layer depletion to global authorities.",
                    "B": "Although environmental scientists cautioned international organizations about ozone depletion, the Montreal Protocol was ratified much later than planned.",
                    "C": "International authorities had already formulated the Montreal Protocol before environmental researchers documented significant damage to the ozone layer.",
                    "D": "Even if scientists had remained silent regarding ozone thinning, world leaders would still have enacted the Montreal Protocol in 1987.",
                    "E": "The Montreal Protocol was ineffective in preventing ozone layer depletion despite urgent scientific warnings presented to global forums."
                },
                "A",
                "Restatement Taktiği: Orijinal cümle bir Type-3 gizli koşuldur ('Had scientists not warned... = If scientists had not warned... protocol would never have been signed' -> Bilim insanları uyarısı olmasaydı imzalanmazdı, yani tam olarak bilim insanlarının ısrarlı uyarıları sayesinde imzalandı). A şıkkı bu neden-sonuç ilişkisini 'precisely because environmental scientists maintained relentless warnings' ile kusursuz verir.",
                "Cümle Çevirisi: 'Çevre bilimcileri uluslararası kuruluşları ozon tabakasının incelmesi konusunda ısrarla uyarmamış olsaydı, 1987 Montreal Protokolü asla imzalanmazdı.' A seçeneği aynı anlamı vermektedir.",
                {"depletion": "tükenme, incelme", "ratify": "onaylamak, yürürlüğe koymak", "relentless": "dur durak bilmeyen, amansız"},
                ["restatement", "environment", "history"]
            ),
            (
                69, "Anlamca En Yakın Cümle", "Koşul ve Kısıtlama", "Orta",
                "Only by conserving the genetic diversity of wild fruit ancestors like the apple can modern agriculture safeguard food supplies against unforeseen plant pandemics.",
                {
                    "A": "Preserving the genetic variability of wild fruit forebears such as the apple is the sole means by which modern agriculture can protect future harvests from unexpected diseases.",
                    "B": "Modern agriculture has completely secured global fruit production against pandemics without needing to rely on wild apple ancestors.",
                    "C": "Conserving wild fruit ancestors is helpful, but modern genetic engineering can easily protect crops from pandemics without them.",
                    "D": "Unforeseen plant epidemics will wipe out modern apple orchards regardless of whether wild genetic stocks are preserved.",
                    "E": "Wild apple ancestors are far more susceptible to unexpected agricultural pandemics than modern commercially bred fruits."
                },
                "A",
                "Restatement Taktiği: 'Only by conserving... can modern agriculture safeguard...' (Yalnızca koruyarak güvence altına alabilir = tek yol budur). A şıkkındaki 'is the sole means by which...' ifadesi 'only by' yapısının birebir karşılığıdır.",
                "Cümle Çevirisi: 'Modern tarım, gıda arzını öngörülemeyen bitki pandemilerine karşı ancak elma gibi yabani meyve atalarının genetik çeşitliliğini koruyarak emniyete alabilir.'",
                {"forebear": "ata", "sole means": "tek yol, yegane araç", "unforeseen": "öngörülemeyen", "apple": "elma"},
                ["apple", "restatement", "agriculture"]
            ),
            (
                70, "Anlamca En Yakın Cümle", "Zıtlık / Taviz", "Zor",
                "Despite possessing vast computational power, contemporary artificial neural networks cannot genuinely comprehend the contextual meaning of human emotional nuances.",
                {
                    "A": "Even though modern artificial neural networks boast immense processing capabilities, they remain incapable of truly grasping the contextual subtleties of human emotions.",
                    "B": "Contemporary artificial neural networks are increasingly mastering human emotional nuances because of their expanding computational capacities.",
                    "C": "Because human emotions are too irrational to be calculated, artificial neural networks have abandoned all linguistic and contextual research.",
                    "D": "Neither human emotional nuances nor context-dependent language can ever be simulated by computational processing machines.",
                    "E": "Human emotional nuances are fundamentally simpler than the vast computational operations performed by artificial neural networks."
                },
                "A",
                "Restatement Taktiği: 'Despite possessing vast power' (büyük güce sahip olmasına rağmen) = 'Even though they boast immense processing capabilities'. 'cannot genuinely comprehend' (gerçekten anlayamaz) = 'remain incapable of truly grasping'. A şıkkı eşanlamlılarla tam oturur.",
                "Cümle Çevirisi: 'Muazzam hesaplama gücüne sahip olmasına rağmen, günümüz yapay sinir ağları insan duygusal nüanslarının bağlamsal anlamını gerçekten kavrayamamaktadır.'",
                {"nuance": "nüans, ince ayrım", "grasp": "kavramak", "subtlety": "incelik"},
                ["restatement", "technology", "ai"]
            ),
            (
                71, "Anlamca En Yakın Cümle", "Sebep-Sonuç", "Orta",
                "Because prolonged exposure to blue light from digital displays suppresses melatonin secretion, it often leads to severe insomnia and disrupted circadian rhythms.",
                {
                    "A": "Extended screen time frequently induces acute insomnia and upsets the natural sleep cycle by hindering the production of melatonin.",
                    "B": "Melatonin production increases significantly when individuals spend prolonged hours in front of bright digital screens at night.",
                    "C": "Insomnia and circadian rhythm disruptions are caused primarily by psychological stress rather than digital screen illumination.",
                    "D": "Unless individuals avoid blue light from electronic devices, their melatonin secretion will permanently cease.",
                    "E": "Even if digital screens emitted zero blue light, insomnia rates among teenagers would continue to escalate."
                },
                "A",
                "Restatement Taktiği: 'prolonged exposure' -> 'extended screen time'; 'suppresses melatonin' -> 'by hindering the production of melatonin'; 'leads to severe insomnia and disrupted circadian rhythms' -> 'frequently induces acute insomnia and upsets the natural sleep cycle'. A şıkkı tam karşılıktır.",
                "Cümle Çevirisi: 'Dijital ekranlardan gelen mavi ışığa uzun süre maruz kalmak melatonin salgılanmasını baskıladığından, sıklıkla şiddetli uykusuzluğa ve sirkadiyen ritmin bozulmasına yol açar.'",
                {"suppress": "baskılamak", "insomnia": "uykusuzluk", "hinder": "engellemek", "circadian": "günlük biyolojik ritim"},
                ["restatement", "health", "science"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in restatements:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": "",
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 72-75: PARAGRAF TAMAMLAMA
        # ==========================================
        paragraph_completions = [
            (
                72, "Paragraf Tamamlama", "Paragraf Akışı", "Zor",
                "For centuries, the Silk Road was celebrated not merely as a conduit for luxury goods like silk and porcelain, but as a dynamic artery of biological exchange. Along with religious beliefs and astronomical manuscripts, merchants transported vital agricultural cultivars across continents. ------. Modern genetic analyses reveal that these nomadic exchanges fundamentally diversified Eurasian crop cultivation, shaping food systems from China to the Mediterranean.",
                {
                    "A": "Among the most transformative horticultural transfers were wild apple and walnut varieties carried out of Central Asian mountain passes",
                    "B": "However, most ancient traders avoided carrying any plant seeds due to strict customs inspections at frontier checkpoints",
                    "C": "Maritime shipping routes eventually rendered all overland caravan trade obsolete within a few short years",
                    "D": "Silk production techniques remained a fiercely guarded state secret that never reached western territories",
                    "E": "Nomadic pastoralists refused to adopt any agricultural practices, relying exclusively on animal husbandry"
                },
                "A",
                "Paragraf Tamamlama Taktiği: Boşluktan önceki cümle: 'merchants transported vital agricultural cultivars across continents' (tüccarlar kıtalar arasında hayati tarımsal çeşitleri taşıdılar). Boşluktan sonraki cümle: 'Modern genetic analyses reveal that these nomadic exchanges fundamentally diversified Eurasian crop cultivation...' (Modern genetik analizler bu göçebe takasların Avrasya tarımını temelden çeşitlendirdiğini ortaya koymaktadır). Boşluğa bu tarımsal bitki transferinin somut örneği gelmelidir (A şıkkı: yabani elma ve ceviz türlerinin taşınması).",
                "Cümle Çevirisi: 'En dönüştürücü bahçecilik transferleri arasında, Orta Asya dağ geçitlerinden taşınan yabani elma ve ceviz çeşitleri yer alıyordu.'",
                {"conduit": "kanal, vasıta", "cultivar": "ekili bitki çeşidi", "horticultural": "bahçe ziraati", "apple": "elma"},
                ["apple", "paragraph completion", "history", "agriculture"]
            ),
            (
                73, "Paragraf Tamamlama", "Çevre & Enerji", "Orta",
                "Geothermal energy utilizes the natural thermal heat generated within the Earth's molten core. Unlike wind and solar power, which fluctuate depending on weather conditions, geothermal reservoirs deliver a continuous, baseload supply of clean electricity. ------. As drilling technologies advance, access to deeper subsurface thermal layers will make clean geothermal generation viable in regions far beyond active volcanic zones.",
                {
                    "A": "This remarkable reliability makes it an indispensable component for stabilizing renewable power grids",
                    "B": "Nevertheless, geothermal stations emit vast clouds of black carbon particulate matter into the atmosphere",
                    "C": "Solar panel arrays require significantly less capital investment than wind turbines",
                    "D": "Coal combustion remains the most economical method for generating thermal electricity worldwide",
                    "E": "Most volcanic island nations have completely dismantled their domestic geothermal power plants"
                },
                "A",
                "Paragraf Tamamlama Taktiği: Boşluktan önce jeotermal enerjinin rüzgar ve güneşin aksine 'kesintisiz ve sürekli' (continuous, baseload supply) olduğu söylenmiştir. Boşluğa bu güvenilirliği niteleyen 'This remarkable reliability makes it an indispensable component...' cümlesi (A şıkkı) akışa tam oturur.",
                "Cümle Çevirisi: 'Bu kayda değer güvenilirlik, onu yenilenebilir elektrik şebekelerini dengelemek için vazgeçilmez bir bileşen haline getirmektedir.'",
                {"geothermal": "jeotermal", "fluctuate": "dalgalanmak", "baseload": "taban yük, kesintisiz güç"},
                ["paragraph completion", "energy", "environment"]
            ),
            (
                74, "Paragraf Tamamlama", "Bilişsel Psikoloji", "Orta",
                "Psychologists describe the 'confirmation bias' as the universal human tendency to favor information that corroborates pre-existing beliefs. When presented with contradictory evidence, people often dismiss or scrutinize it with disproportionate skepticism. ------. Consequently, polarized opinions become further entrenched rather than harmonized through dialogue.",
                {
                    "A": "Conversely, even ambiguous data that seems to support their initial stance is readily embraced without critical examination",
                    "B": "In contrast, professional scientific researchers never fall victim to cognitive biases or subjective preferences",
                    "C": "Therefore, social media algorithms have completely eliminated political extremism across democratic societies",
                    "D": "Most individuals actively seek out opposing viewpoints to ensure their personal worldview remains balanced",
                    "E": "Confirmation bias is observed solely among older populations with limited access to public education"
                },
                "A",
                "Paragraf Tamamlama Taktiği: Boşluktan önce: Çelişkili kanıtlar görüldüğünde insanlar bunu şüpheyle reddederler. Boşlukta bunun zıddı (kendi fikrini destekleyen muğlak verileri ise sorgulamadan kabul ederler) gelmelidir ('Conversely, even ambiguous data that seems to support their stance is readily embraced...'). Sonraki 'entrenched' (kutuplaşmış fikirlerin kemikleşmesi) sonucu da bunu teyit eder.",
                "Cümle Çevirisi: 'Aksine, ilk görüşlerini destekler gibi görünen belirsiz veriler bile eleştirel bir inceleme olmaksızın hevesle benimsenir.'",
                {"confirmation bias": "doğrulama yanlılığı", "corroborate": "doğrulamak, teyit etmek", "entrenched": "kemikleşmiş"},
                ["paragraph completion", "psychology"]
            ),
            (
                75, "Paragraf Tamamlama", "Tıp & Antibiyotik", "Zor",
                "Bacterial biofilms are dense microbiological communities encased in self-produced protective slime. Within these structured clusters, bacteria communicate via chemical signaling molecules in a process known as quorum sensing. ------. As a result, chronic infections caused by biofilm-forming pathogens require drastically elevated drug dosages that can be toxic to human organs.",
                {
                    "A": "This protective matrix acts as a physical shield that prevents standard antibiotics and immune cells from penetrating the bacterial colony",
                    "B": "Consequently, most superficial skin cuts heal instantaneously without medical antiseptic treatments",
                    "C": "Viruses can easily penetrate these slime layers because they replicate through photosynthetic mechanisms",
                    "D": "Pharmaceutical scientists have successfully synthesized universal antibiotics that dissolve all forms of bacterial slime",
                    "E": "Biofilm formation is confined entirely to extreme hydrothermal oceanic vents and never occurs inside human hosts"
                },
                "A",
                "Paragraf Tamamlama Taktiği: Boşluktan önce koruyucu balçık kılıfından ('protective slime') bahsedilmiş, boşluktan sonra ise antibiyotiklerin çok yüksek dozlarda verilmek zorunda kalındığı belirtilmiştir. Boşluğa bu kılıfın antibiyotiklerin içeri girmesini engelleyen bir kalkan olduğunu açıklayan A şıkkı gelmelidir ('This protective matrix acts as a physical shield that prevents standard antibiotics...').",
                "Cümle Çevirisi: 'Bu koruyucu matris, standart antibiyotiklerin ve bağışıklık hücrelerinin bakteri kolonisine nüfuz etmesini engelleyen fiziksel bir kalkan görevi görür.'",
                {"biofilm": "biyofilm", "matrix": "matris, doku", "penetrate": "nüfuz etmek, içine girmek"},
                ["paragraph completion", "medicine", "biology"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in paragraph_completions:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": "",
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # ==========================================
        # 76-80: ANLATIM BÜTÜNLÜĞÜNÜ BOZAN CÜMLE
        # ==========================================
        irrelevant_specs = [
            (
                76, "Anlatım Bütünlüğünü Bozan Cümle", "Konu Bütünlüğü", "Orta",
                "(I) Coral reefs occupy less than one percent of the ocean floor, yet they provide shelter for more than twenty-five percent of all marine species. "
                "(II) In recent decades, rising sea surface temperatures have triggered mass coral bleaching events across tropical archipelagos. "
                "(III) When water warms excessively, corals expel the symbiotic photosynthetic algae residing in their tissues, turning completely white. "
                "(IV) Scuba diving equipment has become remarkably inexpensive, allowing tourists to explore coastal shipwrecks worldwide. "
                "(V) Deprived of these microscopic algae, the corals starve and become highly susceptible to lethal infections.",
                {"A": "I", "B": "II", "C": "III", "D": "IV", "E": "V"},
                "D",
                "Akışı Bozan Cümle Taktiği: Paragraf mercan resifleri, sıcak suyun mercan beyazlamasına (coral bleaching) yol açması ve alglerin ölümü üzerinedir (I, II, III, V birbiriyle sıkı nedensellik bağlamındadır). Ancak IV numaralı cümle tüplü dalış ekipmanlarının ucuzlamasından ve batık turizminden bahsederek konunun tamamen dışına çıkmıştır.",
                "IV numaralı cümle (D seçeneği) metnin bilimsel ve ekolojik akışını bozmaktadır.",
                {"bleaching": "beyazlama", "symbiotic": "simbiyotik, ortak yaşayan", "expel": "dışarı atmak, kovmak"},
                ["irrelevant sentence", "marine", "environment"]
            ),
            (
                77, "Anlatım Bütünlüğünü Bozan Cümle", "Konu Bütünlüğü", "Orta",
                "(I) Organic apple growers rely heavily on biological controls rather than synthetic pesticides to safeguard their seasonal crop yields. "
                "(II) By introducing predatory insects like ladybugs into the orchard, farmers naturally suppress aphid infestations. "
                "(III) Furthermore, intercropping flowering clover between tree rows attracts pollinating wild bumblebees and improves soil nitrogen levels. "
                "(IV) Commercial apple cider was traditionally fermented in large charred oak barrels throughout colonial North America. "
                "(V) These holistic practices allow orchardists to harvest pristine fruit while keeping the surrounding ecosystem balanced and toxin-free.",
                {"A": "I", "B": "II", "C": "III", "D": "IV", "E": "V"},
                "D",
                "Akışı Bozan Cümle Taktiği: Paragraf organik elma yetiştiriciliğinde doğal böcek kontrolü ve ekolojik tarım yöntemlerini anlatmaktadır (I, II, III, V). IV numaralı cümle ise sömürge döneminde elma sirkesinin/şarabının meşe fıçılarda fermente edilmesinden bahsederek tarihsel ve alakasız bir konuya atlamıştır.",
                "IV numaralı cümle (D seçeneği) tarımsal yöntem akışını bozmaktadır.",
                {"predatory": "avcı, yırtıcı", "infestation": "istila, sarma", "intercropping": "ara ziraat, karışık ekim", "apple": "elma"},
                ["apple", "irrelevant sentence", "agriculture"]
            ),
            (
                78, "Anlatım Bütünlüğünü Bozan Cümle", "Konu Bütünlüğü", "Orta",
                "(I) The invention of the printing press by Johannes Gutenberg in the mid-fifteenth century revolutionized European intellectual history. "
                "(II) Before movable type, books were laboriously transcribed by hand, restricting literacy exclusively to elite religious cloisters. "
                "(III) Gutenberg's mechanical innovation dramatically lowered production costs, allowing scientific treatises and philosophical texts to circulate widely. "
                "(IV) Modern digital smartphones feature high-resolution displays that can stream four-kilobyte video files over wireless cellular networks. "
                "(V) Consequently, the rapid dissemination of printed knowledge fueled the Protestant Reformation and the Scientific Revolution.",
                {"A": "I", "B": "II", "C": "III", "D": "IV", "E": "V"},
                "D",
                "Akışı Bozan Cümle Taktiği: Paragraf matbaanın icadı ve 15. yüzyıldan itibaren bilginin yayılması (I, II, III, V) hakkındadır. IV numaralı cümle modern akıllı telefonların video çözünürlüğünden bahsederek anlatımı tamamen bozmuştur.",
                "IV numaralı cümle (D seçeneği) matbaa tarihi anlatımına uymamaktadır.",
                {"transcribe": "yazarak kopyalamak", "dissemination": "yayılma, dağıtım", "treatise": "bilimsel risale, tez"},
                ["irrelevant sentence", "history"]
            ),
            (
                79, "Anlatım Bütünlüğünü Bozan Cümle", "Konu Bütünlüğü", "Orta",
                "(I) Chronic psychological stress triggers the continuous release of cortisol and adrenaline into the human bloodstream. "
                "(II) In the short term, these hormones prepare the body to confront or escape danger by elevating heart rate and mobilizing glucose. "
                "(III) However, prolonged hormonal saturation suppresses the immune system and elevates blood pressure to hazardous thresholds. "
                "(IV) Many corporations provide their top executives with generous annual stock bonus incentives to retain talent. "
                "(V) Over time, this unmitigated physiological strain significantly elevates the risk of cardiovascular stroke and chronic depression.",
                {"A": "I", "B": "II", "C": "III", "D": "IV", "E": "V"},
                "D",
                "Akışı Bozan Cümle Taktiği: Paragraf stres hormonlarının (kortizol ve adrenalin) insan vücudu üzerindeki yıkıcı etkilerini (I, II, III, V) anlatmaktadır. IV numaralı cümle şirketlerin yöneticilere hisse senedi primi vermesinden bahsederek biyolojik akışı bozmaktadır.",
                "IV numaralı cümle (D seçeneği) akışı bozan alakasız cümledir.",
                {"bloodstream": "kan dolaşımı", "saturation": "doygunluk", "unmitigated": "hafifletilmemiş, kesintisiz"},
                ["irrelevant sentence", "health", "biology"]
            ),
            (
                80, "Anlatım Bütünlüğünü Bozan Cümle", "Konu Bütünlüğü", "Orta",
                "(I) Volcanic eruptions can exert a substantial cooling influence on global surface temperatures for several consecutive years. "
                "(II) When a volcano erupts with explosive force, it injects millions of tons of sulfur dioxide gas high into the stratosphere. "
                "(III) There, the gas reacts with moisture to form highly reflective sulfate aerosols that scatter incoming solar radiation back into space. "
                "(IV) Mount Pinatubo's 1991 eruption in the Philippines demonstrated this phenomenon by cooling global temperatures by approximately half a degree Celsius. "
                "(V) Commercial airline passengers frequently complain about delays caused by routine airport luggage check-in procedures.",
                {"A": "I", "B": "II", "C": "III", "D": "IV", "E": "V"},
                "E",
                "Akışı Bozan Cümle Taktiği: Paragraf volkanik patlamaların stratosfere sülfür gazı yayarak küresel sıcaklıkları düşürmesini (I, II, III, IV) anlatmaktadır. V numaralı cümle ise havalimanlarında bagaj teslim gecikmelerinden bahsederek konudan tamamen kopmuştur.",
                "V numaralı cümle (E seçeneği) paragrafın bilimsel akışını bozmaktadır.",
                {"stratosphere": "stratosfer", "aerosol": "aerosol, asılı parçacık", "scatter": "saçmak, dağıtmak"},
                ["irrelevant sentence", "volcano", "climate"]
            )
        ]

        for num, cat, subcat, diff, qtext, opts, ans, sol, expl, words, tags in irrelevant_specs:
            year_questions.append({
                "id": f"yds-{year}-{num}",
                "exam": f"YDS {year}",
                "year": year,
                "term": "İlkbahar",
                "questionNumber": num,
                "category": cat,
                "subCategory": subcat,
                "difficulty": diff,
                "passage": "",
                "questionText": qtext,
                "options": opts,
                "correctAnswer": ans,
                "solutionMethod": sol,
                "explanation": expl,
                "wordAnalysis": words,
                "tags": tags
            })

        # Doğru cevapları A, B, C, D, E şıklarına dengeli ve rastgele dağıt (ÖSYM Standart %20 Eşit Dağılım)
        ans_seq = get_balanced_answer_sequence(year)
        for idx, q in enumerate(year_questions):
            q_num = q["questionNumber"]
            if q_num <= 75:
                target = ans_seq[q_num - 1]
                year_questions[idx] = shuffle_question_options(q, target)

        print(f"Year {year} generated: {len(year_questions)} questions.")
        all_questions.extend(year_questions)

    print(f"Total questions generated: {len(all_questions)}")
    return all_questions

if __name__ == "__main__":
    questions = generate_questions()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    questions_file = os.path.join(script_dir, "questions.js")
    
    questions_json = json.dumps(questions, ensure_ascii=False, indent=2)
    
    js_content = f"""// YDS Gerçek Sınav Formatında Kapsamlı Soru Bankası (2018 - 2024 Tam 80'er Soruluk Denemeler)
// Toplam {len(questions)} Adet Soru: Her biri tam metin, 5 şık, doğru cevap, çözüm yöntemi/taktiği, Türkçe detaylı açıklama ve kelime tahlili içerir.

const INITIAL_YDS_QUESTIONS = {questions_json};

// LocalStorage anahtarları
const STORAGE_KEYS = {{
  QUESTIONS: "yds_questions_bank",
  CUSTOM_QUESTIONS: "yds_custom_questions",
  USER_ANSWERS: "yds_user_answers",
  LEARNING_POOL: "yds_learning_pool",
  FAVORITES: "yds_favorites",
  NOTES: "yds_notes",
  EXAM_SESSIONS: "yds_exam_sessions"
}};

// Veri Yönetim Sınıfı
class QuestionRepository {{
  constructor() {{
    this.customQuestions = this.loadCustomQuestions();
    this.questions = [...INITIAL_YDS_QUESTIONS, ...this.customQuestions];
  }}

  loadCustomQuestions() {{
    try {{
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      if (saved) {{
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }}
    }} catch (e) {{
      console.error("Özel sorular yüklenirken hata:", e);
    }}
    return [];
  }}

  saveCustomQuestions(list) {{
    this.customQuestions = list;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(list));
    this.questions = [...INITIAL_YDS_QUESTIONS, ...this.customQuestions];
  }}

  addQuestions(newQuestions) {{
    const existingIds = new Set(this.questions.map(q => q.id));
    const toAdd = newQuestions.filter(q => !existingIds.has(q.id));
    const updatedCustom = [...this.customQuestions, ...toAdd];
    this.saveCustomQuestions(updatedCustom);
    return toAdd.length;
  }}

  getAll() {{
    return this.questions;
  }}

  getByYear(year) {{
    const y = parseInt(year);
    return this.questions.filter(q => q.year === y).sort((a, b) => a.questionNumber - b.questionNumber);
  }}

  getAvailableYears() {{
    const years = [...new Set(this.questions.map(q => q.year).filter(Boolean))];
    return years.sort((a, b) => b - a);
  }}

  resetToDefault() {{
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    this.customQuestions = [];
    this.questions = [...INITIAL_YDS_QUESTIONS];
    return this.questions;
  }}
}}

window.questionRepo = new QuestionRepository();
window.STORAGE_KEYS = STORAGE_KEYS;
window.INITIAL_YDS_QUESTIONS = INITIAL_YDS_QUESTIONS;
"""

    with open(questions_file, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"Başarıyla yazıldı: {questions_file} (Boyut: {os.path.getsize(questions_file)} bayt)")

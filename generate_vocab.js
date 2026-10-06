const fs = require('fs');

const wordsText = `
abandon:terk etmek
abbreviate:kısaltmak
abduct:kaçırmak
abolish:yürürlükten kaldırmak
absorb:emmek, içine çekmek
abstain:kaçınmak, uzak durmak
abundant:bol, bereketli
accelerate:hızlandırmak
accept:kabul etmek
access:erişim
accessible:erişilebilir
accommodate:barındırmak
accompany:eşlik etmek
accomplish:başarmak
accumulate:biriktirmek
accurate:doğru, kesin
accuse:suçlamak
achieve:başarmak
acknowledge:kabul etmek, onaylamak
acquire:edinmek, kazanmak
adapt:uyum sağlamak
addict:bağımlı
adequate:yeterli
adjust:ayarlamak, uyum sağlamak
administer:yönetmek, uygulamak
admire:hayran olmak
admit:kabul etmek, itiraf etmek
adopt:benimsemek, evlat edinmek
advance:ilerlemek, gelişmek
advantage:avantaj
adverse:ters, olumsuz
advocate:savunmak, desteklemek
affect:etkilemek
afford:gücü yetmek
aggravate:kötüleştirmek
aggressive:agresif, saldırgan
alienate:yabancılaştırmak
align:hizalamak, aynı hizaya getirmek
allege:iddia etmek
alleviate:hafifletmek
allocate:tahsis etmek, ayırmak
allow:izin vermek
alter:değiştirmek
ambiguous:belirsiz
amend:değiştirmek, düzeltmek
anticipate:ummak, beklemek
apologize:özür dilemek
appall:korkutmak, dehşete düşürmek
apparent:açık, bariz
appeal:başvurmak, cazip gelmek
appear:görünmek
apply:uygulamak, başvurmak
appoint:atamak
appreciate:takdir etmek
approach:yaklaşım, yaklaşmak
appropriate:uygun
approve:onaylamak
argue:tartışmak
arise:ortaya çıkmak
arouse:uyandırmak (duygu)
arrange:düzenlemek
assess:değerlendirmek
assign:atamak, görevlendirmek
assist:yardım etmek
associate:ilişkilendirmek
assume:varsaymak
assure:garanti vermek, inandırmak
attach:eklemek, bağlamak
attack:saldırmak
attain:elde etmek, ulaşmak
attempt:girişim, teşebbüs etmek
attend:katılmak
attract:çekmek (dikkat, ilgi)
attribute:bağlamak, yormak
avoid:kaçınmak
award:ödül, ödüllendirmek
ban:yasaklamak
barely:zar zor
benefit:fayda
bias:ön yargı
blame:suçlamak
boost:artırmak, yükseltmek
bother:rahatsız etmek
breakthrough:büyük buluş, dönüm noktası
bribe:rüşvet
brief:kısa, özet
broadcast:yayınlamak
candid:içten, samimi
capacity:kapasite
capture:yakalamak
cause:sebep olmak
cease:durdurmak, son vermek
celebrate:kutlamak
charge:şarj etmek, suçlamak, ücret
clarify:açıklığa kavuşturmak
clash:çarpışmak, çatışmak
classify:sınıflandırmak
coincide:aynı zamana denk gelmek
collapse:çökmek
collide:çarpışmak
combat:savaşmak, mücadele etmek
combine:birleştirmek
commit:adamak, işlemek (suç)
communicate:iletişim kurmak
compare:karşılaştırmak
compel:zorlamak
compensate:telafi etmek
compete:rekabet etmek
compile:derlemek
complain:şikayet etmek
complete:tamamlamak
comply:uymak, itaat etmek
compose:oluşturmak, bestelemek
comprehend:anlamak, kavramak
comprise:içermek, kapsamak
conceal:gizlemek
concede:kabul etmek
conceive:düşünmek, tasarlamak
concentrate:odaklanmak
conclude:sonuçlandırmak
condemn:kınamak
conduct:yürütmek
confess:itiraf etmek
confine:sınırlandırmak
confirm:onaylamak
conflict:çatışma
conform:uymak
confront:yüzleşmek
confuse:kafasını karıştırmak
connect:bağlamak
conquer:fethetmek
consent:razı olmak
conserve:korumak, muhafaza etmek
consider:düşünmek, dikkate almak
consist:oluşmak
consolidate:sağlamlaştırmak
constitute:oluşturmak
constrain:zorlamak, sınırlamak
construct:inşa etmek
consume:tüketmek
contact:iletişim
contain:içermek
contaminate:kirletmek
contemplate:düşünmek
contend:iddia etmek, tartışmak
contradict:çelişmek
contribute:katkıda bulunmak
control:kontrol etmek
convince:ikna etmek
cope:başa çıkmak
corrupt:yozlaşmış
cost:maliyet, mal olmak
create:yaratmak
credible:güvenilir
crucial:çok önemli
cure:tedavi
damage:zarar
deal:ilgilenmek, anlaşmak
debate:tartışma
decay:çürümek
deceive:kandırmak
decide:karar vermek
declare:ilan etmek
decline:reddetmek, azalmak
decrease:azalmak
dedicate:adamak
deduce:sonuç çıkarmak
defeat:yenmek
defend:savunmak
defer:ertelemek
define:tanımlamak
delay:gecikmek, ertelemek
delete:silmek
deliberate:kasıtlı
deliver:teslim etmek
demand:talep etmek
demonstrate:göstermek, kanıtlamak
deny:inkar etmek
depart:ayrılmak
depend:bağlı olmak
depict:tasvir etmek
deplete:tüketmek
derive:türetmek, kaynaklanmak
descend:inmek
describe:tanımlamak, betimlemek
desert:çöl, terk etmek
deserve:hak etmek
design:tasarlamak
desire:arzu
destroy:yok etmek
detect:tespit etmek
determine:belirlemek
develop:geliştirmek
devote:adamak
diagnose:teşhis koymak
dictate:dikte etmek
differ:farklı olmak
differentiate:ayırt etmek
diminish:azalmak
direct:yönlendirmek
disagree:aynı fikirde olmamak
disappear:gözden kaybolmak
disappoint:hayal kırıklığına uğratmak
disaster:felaket
discard:atmak, gözden çıkarmak
discharge:taburcu etmek, tahliye etmek
discover:keşfetmek
discriminate:ayrımcılık yapmak
discuss:tartışmak
disease:hastalık
disgust:iğrenmek
dismiss:kovmak, reddetmek
display:göstermek, sergilemek
dispose:kurtulmak, atmak
dispute:anlaşmazlık, tartışmak
disrupt:bozmak, aksatmak
dissolve:çözünmek
distinguish:ayırt etmek
distort:çarpıtmak
distract:dikkatini dağıtmak
distribute:dağıtmak
dive:dalmak
divide:bölmek
donate:bağış yapmak
doubt:şüphe
drag:sürüklemek
draw:çizmek, çekmek
dread:korkmak
drop:düşmek, bırakmak
drown:boğulmak
earn:kazanmak
ease:kolaylaştırmak
educate:eğitmek
effect:etki
efficient:verimli
eject:fırlatmak, dışarı atmak
elaborate:ayrıntılı açıklamak
elevate:yükseltmek
eliminate:ortadan kaldırmak
embarrass:utandırmak
emerge:ortaya çıkmak
emit:yaymak
emphasize:vurgulamak
employ:işe almak
empty:boşaltmak
enable:olanak sağlamak
enclose:iliştirmek
encounter:karşılaşmak
encourage:cesaretlendirmek
end:sona ermek
endanger:tehlikeye atmak
endorse:onaylamak, desteklemek
endure:dayanmak, katlanmak
force:zorlamak
forecast:tahmin etmek
forge:şekillendirmek, sahtesini yapmak
forget:unutmak
forgive:affetmek
form:oluşturmak
formulate:formüle etmek
foster:büyütmek, geliştirmek
found:kurmak
frame:çerçevelemek, şekillendirmek
free:özgür bırakmak
freeze:donmak
frighten:korkutmak
frustrate:hayal kırıklığına uğratmak
fulfill:yerine getirmek
gain:kazanmak
gather:toplanmak
generate:üretmek
get:almak, elde etmek
give:vermek
glance:göz atmak
go:gitmek
govern:yönetmek
grab:yakalamak, kapmak
grant:vermek, bağışlamak
grasp:kavramak
greet:selamlamak
grieve:üzülmek, yas tutmak
grow:büyümek
guarantee:garanti etmek
guard:korumak
guess:tahmin etmek
guide:rehberlik etmek
halt:durmak
hand:vermek, uzatmak
handle:ele almak, halletmek
hang:asmak
happen:olmak, meydana gelmek
harm:zarar vermek
harvest:hasat etmek
hate:nefret etmek
heal:iyileşmek
hear:duymak
heat:ısıtmak
help:yardım etmek
hesitate:tereddüt etmek
hide:saklamak
hinder:engellemek
hire:işe almak
hit:vurmak
hold:tutmak
hope:umut etmek
host:ev sahipliği yapmak
hunt:avlamak
hurry:acele etmek
hurt:incitmek
identify:tanımlamak
ignore:görmezden gelmek
illustrate:örneklemek
imagine:hayal etmek
imitate:taklit etmek
impact:etkilemek
impair:bozmak, zarar vermek
implement:uygulamak
imply:ima etmek
import:ithal etmek
impose:dayatmak
impress:etkilemek
improve:geliştirmek
include:içermek
incorporate:dahil etmek
increase:artırmak
indicate:belirtmek, göstermek
induce:ikna etmek, neden olmak
infect:enfekte etmek
infer:sonuç çıkarmak
influence:etkilemek
inform:bilgilendirmek
infringe:ihlal etmek
inherit:miras almak
initiate:başlatmak
inject:enjekte etmek
injure:yaralamak
innovate:yenilik yapmak
inquire:sormak, soruşturmak
insert:eklemek
insist:ısrar etmek
inspect:incelemek
inspire:ilham vermek
install:kurmak
instruct:talimat vermek
insult:hakaret etmek
insure:sigortalamak
integrate:entegre etmek
intend:niyet etmek
intensify:yoğunlaştırmak
interact:etkileşimde bulunmak
interfere:müdahale etmek
interpret:yorumlamak
interrupt:sözünü kesmek
intervene:araya girmek
introduce:tanıtmak
invent:icat etmek
invest:yatırım yapmak
investigate:araştırmak
invite:davet etmek
involve:içermek, dahil etmek
isolate:izole etmek
issue:yayınlamak
join:katılmak
judge:yargılamak
jump:zıplamak
justify:haklı çıkarmak
keep:tutmak, saklamak
kick:tekmelemek
kill:öldürmek
kiss:öpmek
know:bilmek
lack:eksik olmak
land:inmek (uçak)
last:sürmek (zaman)
laugh:gülmek
launch:başlatmak, fırlatmak
lay:koymak, sermek
lead:yol açmak, liderlik etmek
leak:sızdırmak
lean:eğilmek, yaslanmak
leap:sıçramak
learn:öğrenmek
leave:ayrılmak, bırakmak
lend:ödünç vermek
let:izin vermek
liberate:özgürleştirmek
lie:yalan söylemek, uzanmak
lift:kaldırmak
light:aydınlatmak
limit:sınırlandırmak
linger:oyalanmak
link:bağlamak
list:listelemek
listen:dinlemek
live:yaşamak
load:yüklemek
locate:bulunmak
lock:kilitlemek
look:bakmak
lose:kaybetmek
love:sevmek
lower:düşürmek
maintain:sürdürmek, iddia etmek
make:yapmak
manage:yönetmek, başarmak
manipulate:yönlendirmek
manufacture:üretmek
mark:işaretlemek
marry:evlenmek
match:eşleşmek
matter:önemli olmak
mean:anlamına gelmek
measure:ölçmek
meet:buluşmak, karşılamak
melt:erimek
mention:bahsetmek
merge:birleşmek
migrate:göç etmek
mind:önemsemek
minimize:en aza indirmek
miss:özlemek, kaçırmak
misunderstand:yanlış anlamak
mix:karıştırmak
modify:değiştirmek
monitor:izlemek
motivate:motive etmek
mount:binmek, artmak
mourn:yas tutmak
move:hareket etmek
multiply:çarpmak, çoğalmak
murder:cinayet işlemek
name:isim vermek
navigate:gezinmek, yönlendirmek
need:ihtiyaç duymak
neglect:ihmal etmek
negotiate:müzakere etmek
nod:başını sallamak
note:not etmek
notice:fark etmek
notify:bildirmek
nourish:beslemek
obey:itaat etmek
object:itiraz etmek
observe:gözlemlemek
obsess:takıntı yapmak
obtain:elde etmek
occupy:işgal etmek
occur:meydana gelmek
offend:gücendirmek
offer:teklif etmek
omit:atlanmak, çıkarmak
open:açmak
operate:işletmek, ameliyat etmek
oppose:karşı çıkmak
oppress:baskı yapmak
opt:tercih etmek
order:emretmek, sipariş vermek
organize:organize etmek
originate:kaynaklanmak
outline:özetlemek
outlive:daha uzun yaşamak
outperform:daha iyi performans göstermek
outrage:öfkelendirmek
outweigh:daha ağır basmak
overcome:üstesinden gelmek
overestimate:fazla tahmin etmek
overlap:örtüşmek
overlook:gözden kaçırmak
overtake:sollamak
overthrow:devirmek
owe:borçlu olmak
own:sahip olmak
pack:paketlemek
paint:boyamak
participate:katılmak
pass:geçmek
pause:duraklatmak
pay:ödemek
perceive:algılamak
perform:gerçekleştirmek
perish:yok olmak
permit:izin vermek
persist:ısrar etmek, sürmek
persuade:ikna etmek
phase:aşamalandırmak
pick:seçmek, toplamak
place:yerleştirmek
plan:planlamak
plant:dikmek
play:oynamak
plead:yalvarmak
please:memnun etmek
point:işaret etmek
pollute:kirletmek
ponder:düşünmek
pop:aniden belirmek
portray:tasvir etmek
pose:teşkil etmek (tehlike vs.)
possess:sahip olmak
postpone:ertelemek
pour:dökmek
practice:pratik yapmak
praise:övmek
pray:dua etmek
preach:vaaz vermek
precede:önce gelmek
predict:tahmin etmek
prefer:tercih etmek
prepare:hazırlamak
prescribe:reçete yazmak
present:sunmak
preserve:korumak
press:bastırmak
pretend:gibi yapmak
prevail:üstün gelmek
prevent:engellemek
price:fiyatlandırmak
print:yazdırmak
prioritize:önceliklendirmek
proceed:ilerlemek
process:işlemek
produce:üretmek
profess:iddia etmek
profit:kar etmek
program:programlamak
progress:ilerlemek
prohibit:yasaklamak
project:yansıtmak
promise:söz vermek
promote:terfi ettirmek, teşvik etmek
prompt:teşvik etmek
pronounce:telaffuz etmek
propose:teklif etmek
protect:korumak
protest:protesto etmek
prove:kanıtlamak
provide:sağlamak
provoke:kışkırtmak
publish:yayınlamak
pull:çekmek
pump:pompalamak
punish:cezalandırmak
purchase:satın almak
pursue:takip etmek
push:itmek
put:koymak
qualify:hak kazanmak
quantify:ölçmek
quarrel:tartışmak
question:sorgulamak
quit:bırakmak
quote:alıntı yapmak
race:yarışmak
raise:kaldırmak, yetiştirmek
range:çeşitlilik göstermek
rank:sıralamak
rate:değerlendirmek
reach:ulaşmak
react:tepki vermek
read:okumak
realize:fark etmek, gerçekleştirmek
reassure:güvence vermek
rebel:isyan etmek
recall:hatırlamak
receive:almak
recognize:tanımak, kabul etmek
recommend:tavsiye etmek
reconcile:uzlaştırmak
record:kaydetmek
recover:iyileşmek, geri kazanmak
recruit:işe almak
reduce:azaltmak
refer:atıfta bulunmak
reflect:yansıtmak
reform:yenilik yapmak
refrain:kaçınmak
refresh:tazelemek
refuse:reddetmek
regain:geri kazanmak
regard:saymak, düşünmek
register:kaydetmek
regret:pişman olmak
regulate:düzenlemek
rehabilitate:rehabilite etmek
reject:reddetmek
rejoice:sevinmek
relate:ilişkilendirmek
relax:rahatlamak
release:serbest bırakmak
rely:güvenmek
remain:kalmak, sürdürmek
remark:belirtmek
remember:hatırlamak
remind:hatırlatmak
remove:kaldırmak
render:durumuna getirmek
renew:yenilemek
rent:kiralamak
repair:tamir etmek
repeat:tekrar etmek
replace:değiştirmek
reply:cevap vermek
report:rapor etmek
represent:temsil etmek
reproduce:üremek, kopyalamak
request:talep etmek
require:gerektirmek
rescue:kurtarmak
research:araştırmak
resemble:benzemek
resent:içerlemek
reserve:ayırtmak
reside:yaşamak (bir yerde)
resign:istifa etmek
resist:direnmek
resolve:çözmek, karar vermek
respect:saygı duymak
respond:yanıt vermek
rest:dinlenmek
restore:eski haline getirmek
restrict:kısıtlamak
result:sonuçlanmak
resume:devam etmek
retain:tutmak, korumak
retire:emekli olmak
retreat:geri çekilmek
retrieve:geri almak
return:geri dönmek
reveal:ortaya çıkarmak
reverse:tersine çevirmek
review:gözden geçirmek
revise:revize etmek
revive:canlandırmak
reward:ödüllendirmek
rid:kurtulmak
ride:binmek
ring:çalmak (telefon)
rise:yükselmek
risk:riske atmak
rob:soymak
rock:sallamak
roll:yuvarlamak
rub:ovmak
ruin:mahvetmek
rule:yönetmek
run:koşmak, işletmek
rush:acele etmek
sacrifice:feda etmek
sail:denize açılmak
satisfy:memnun etmek
save:kurtarmak, biriktirmek
say:söylemek
scale:ölçeklendirmek
scan:taramak
scare:korkutmak
scatter:dağıtmak
schedule:programlamak
scold:azarlamak
score:gol atmak, puan almak
scratch:kazımak
scream:çığlık atmak
screen:göstermek, taramak
screw:vidalamak, mahvetmek
search:aramak
seat:oturtmak
secure:güvenceye almak
see:görmek
seek:aramak, çabalamak
seem:görünmek
seize:ele geçirmek
select:seçmek
sell:satmak
send:göndermek
sense:hissetmek
sentence:hüküm vermek
separate:ayırmak
serve:hizmet etmek
set:ayarlamak, kurmak
settle:yerleşmek, çözmek
sever:kesmek, koparmak
sew:dikmek (dikiş)
shake:sallamak
shape:şekillendirmek
share:paylaşmak
shatter:parçalamak
shave:tıraş olmak
shear:kırkmak
shed:dökmek (yaprak, gözyaşı)
shift:değiştirmek
shine:parlamak
shiver:titremek
shock:şok etmek
shoot:ateş etmek, çekmek (film)
shop:alışveriş yapmak
shorten:kısaltmak
shout:bağırmak
show:göstermek
shrink:daralmak, küçülmek
shrug:omuz silkmak
shut:kapatmak
sigh:iç çekmek
sight:görmek
sign:imzalamak
signal:sinyal vermek
signify:belirtmek, anlamına gelmek
silence:susturmak
simplify:basitleştirmek
simulate:simüle etmek
sin:günah işlemek
sing:şarkı söylemek
sink:batmak
sit:oturmak
sketch:çizmek
skip:atlamak
slam:çarpmak
slap:tokatlamak
slash:kesmek (fiyat vb.)
sleep:uyumak
slide:kaymak
slip:kaymak
smash:parçalamak
smell:koklamak
smile:gülümsemek
smoke:sigara içmek
snap:kopmak, şıklatmak
snatch:kapmak
sneak:gizlice girmek
sneeze:hapşırmak
sniff:koklamak
snore:horlamak
snow:kar yağmak
soak:ıslatmak
soar:yükselmek, uçuşa geçmek
solve:çözmek
soothe:yatıştırmak
sort:sıralamak, sınıflandırmak
sound:ses çıkarmak
sow:ekmek
span:kapsamak
spare:ayırmak, kıyamamak
spark:kıvılcım saçmak, başlatmak
speak:konuşmak
specify:belirlemek
speculate:spekülasyon yapmak
speed:hızlanmak
spell:harf harf söylemek
spend:harcamak
spill:dökmek (sıvı)
spin:dönmek
spit:tükürmak
split:bölmek
spoil:bozmak, şımartmak
sponsor:sponsor olmak
spread:yayılmak
spring:sıçramak
spy:casusluk yapmak
squeak:gıcırdamak
squeeze:sıkmak
stab:bıçaklamak
stabilize:dengelemek
stain:lekelemek
stamp:damgalamak
stand:ayakta durmak, dayanmak
stare:dik dik bakmak
start:başlamak
starve:açlıktan ölmek
state:belirtmek
stay:kalmak
steal:çalmak
steer:yönlendirmek
stem:kaynaklanmak
step:adım atmak
stick:yapıştırmak, batırmak
stimulate:uyarmak, teşvik etmek
sting:sokmak (arı)
stink:pis kokmak
stir:karıştırmak
stitch:dikmek
stop:durmak
store:depolamak
strain:zorlamak
stray:başıboş dolaşmak
stress:vurgulamak
stretch:uzatmak, esnemek
strike:vurmak, grev yapmak
strive:çabalamak
stroke:okşamak
structure:yapılandırmak
struggle:mücadele etmek
study:çalışmak, incelemek
stumble:tökezlemek
submit:teslim etmek, sunmak
subordinate:boyun eğdirmek
subscribe:abone olmak
subside:hafiflemek, dinmek
subsidize:sübvanse etmek
substitute:yerine koymak
subtract:çıkarmak
succeed:başarmak
suck:emmek
suffer:acı çekmek
suffice:yetmek
suggest:önermek
suit:uymak, yakışmak
summarize:özetlemek
summon:çağırmak
supervise:denetlemek
supply:sağlamak
support:desteklemek
suppose:varsaymak
suppress:bastırmak
surpass:aşmak, geçmek
surprise:şaşırtmak
surrender:teslim olmak
surround:çevrelemek
survey:anket yapmak
survive:hayatta kalmak
suspect:şüphelenmek
suspend:askıya almak
sustain:sürdürmek
swallow:yutmak
swear:yemin etmek, küfretmek
sweat:terlemek
sweep:süpürmak
swell:şişmek
swim:yüzmek
swing:sallanmak
switch:değiştirmek
symbolize:sembolize etmek
sympathize:sempati duymak
tackle:ele almak
tailor:uyarlamak
take:almak
talk:konuşmak
tame:evcilleştirmek
tap:hafifçe vurmak
target:hedeflemek
taste:tadına bakmak
teach:öğretmek
tear:yırtmak, ağlamak
tease:alay etmek
tell:söylemek
tempt:cezbetmek
tend:eğiliminde olmak
terminate:sonlandırmak
terrify:dehşete düşürmek
test:test etmek
testify:tanıklık etmek
thank:teşekkür etmek
thicken:kalınlaştırmak
think:düşünmek
threaten:tehdit etmek
throw:fırlatmak
tie:bağlamak
tighten:sıkılaştırmak
tilt:eğmek
time:zamanlamak
tip:bahşiş vermek
tire:yormak
tolerate:hoşgörmek
toss:fırlatmak
touch:dokunmak
tour:tura çıkmak
trace:izini sürmek
track:takip etmek
trade:ticaret yapmak
train:eğitmek
transfer:transfer etmek
transform:dönüştürmek
translate:çevirmek
transmit:iletmek
transport:taşımak
trap:tuzağa düşürmek
travel:seyahat etmek
treat:tedavi etmek, davranmak
tremble:titremek
trick:kandırmak
trigger:tetiklemek
trim:kırpmak
trip:tökezlemek
triumph:zafer kazanmak
trust:güvenmek
try:denemek
tug:asılmak
tumble:yuvarlanmak
turn:dönmek
twist:kıvırmak
type:yazmak (klavyede)
undergo:geçirmek (ameliyat vb.)
understand:anlamak
undertake:üstlenmek
undo:geri almak
unfold:göz önüne sermek
unify:birleştirmek
unite:birleşmek
unlock:kilidini açmak
unpack:paketini açmak
unveil:açığa çıkarmak
update:güncellemek
upgrade:yükseltmek
uphold:savunmak, desteklemek
upset:üzmek
urge:teşvik etmek
use:kullanmak
utilize:kullanmak, yararlanmak
utter:söylemek
vacate:boşaltmak
validate:doğrulamak
value:değer vermek
vanish:gözden kaybolmak
vary:çeşitlilik göstermek
veil:örtmek
verify:doğrulamak
view:görüntülemek
violate:ihlal etmek
visit:ziyaret etmek
voice:dile getirmek
volunteer:gönüllü olmak
vote:oy vermek
vow:yemin etmek
wait:beklemek
wake:uyanmak
walk:yürümek
wander:dolaşmak
want:istemek
warm:ısıtmak
warn:uyarmak
wash:yıkamak
waste:israf etmek
watch:izlemek
water:sulamak
wave:el sallamak
weaken:zayıflatmak
wear:giymek
weave:dokumak
weep:ağlamak
weigh:tartmak
welcome:karşılamak
whip:kırbaçlamak
whisper:fısıldamak
whistle:ıslık çalmak
widen:genişletmek
will:istemek, irade göstermek
win:kazanmak
wind:sarmak
wipe:silmek
wish:dilemek
withdraw:geri çekmek, para çekmek
wither:solmak
withhold:alıkoymak
withstand:dayanmak
witness:tanık olmak
wonder:merak etmek
work:çalışmak
worry:endişelenmek
worsen:kötüleşmek
wrap:sarmak
wreck:mahvetmek
wrestle:güreşmek
wrinkle:kırıştırmak
write:yazmak
yield:ürün vermek, boyun eğmek
`;

const items = [];
const lines = wordsText.trim().split('\n');
for (const line of lines) {
    if (!line.trim()) continue;
    const [w, tr] = line.split(':');
    if (w && tr) {
        items.push({
            word: w.trim(),
            tr: tr.trim(),
            freq: Math.floor(Math.random() * 200) + 50 // Mock frequency
        });
    }
}

const jsContent = `// Auto-generated YDS Vocab List (Highly curated)
const VOCAB_LIST = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync('vocab-data.js', jsContent);
if (fs.existsSync('www')) {
    fs.writeFileSync('www/vocab-data.js', jsContent);
}
console.log('Created vocab-data.js with ' + items.length + ' words');

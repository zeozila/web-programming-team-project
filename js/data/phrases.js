// Phrasebook: English + Korean + Mongolian, each with an easy romanization.

export const PHRASE_GROUPS = {
  basics: "Basics",
  food: "Food & drink",
  transport: "Getting around",
  shopping: "Shopping",
  emergency: "Help!",
};

export const PHRASES = [
  // Basics
  { group: "basics", en: "Hello", ko: "안녕하세요", koRom: "annyeonghaseyo", mn: "Сайн байна уу?", mnRom: "sain baina uu?" },
  { group: "basics", en: "Hi (to friends)", ko: "안녕", koRom: "annyeong", mn: "Сайн уу", mnRom: "sain uu" },
  { group: "basics", en: "Thank you", ko: "감사합니다", koRom: "gamsahamnida", mn: "Баярлалаа", mnRom: "bayarlalaa" },
  { group: "basics", en: "It's okay / No problem", ko: "괜찮아요", koRom: "gwaenchanayo", mn: "Зүгээр", mnRom: "zügeer" },
  { group: "basics", en: "Yes", ko: "네", koRom: "ne", mn: "Тийм", mnRom: "tiim" },
  { group: "basics", en: "No", ko: "아니요", koRom: "aniyo", mn: "Үгүй", mnRom: "ügüi" },
  { group: "basics", en: "Sorry", ko: "죄송합니다", koRom: "joesonghamnida", mn: "Уучлаарай", mnRom: "uuchlaarai" },
  { group: "basics", en: "Goodbye", ko: "안녕히 계세요", koRom: "annyeonghi gyeseyo", mn: "Баяртай", mnRom: "bayartai" },
  { group: "basics", en: "Good morning", ko: "좋은 아침이에요", koRom: "joeun achimieyo", mn: "Өглөөний мэнд", mnRom: "öglöönii mend" },
  { group: "basics", en: "Good night", ko: "안녕히 주무세요", koRom: "annyeonghi jumuseyo", mn: "Сайхан амраарай", mnRom: "saikhan amraarai" },
  { group: "basics", en: "Nice to meet you", ko: "만나서 반갑습니다", koRom: "mannaseo bangapseumnida", mn: "Танилцсандаа баяртай байна", mnRom: "taniltssandaa bayartai baina" },
  { group: "basics", en: "My name is …", ko: "제 이름은 …입니다", koRom: "je ireumeun … imnida", mn: "Миний нэрийг … гэдэг", mnRom: "minii neriig … gedeg" },
  { group: "basics", en: "I'm from Mongolia", ko: "저는 몽골에서 왔어요", koRom: "jeoneun monggoreseo wasseoyo", mn: "Би Монголоос ирсэн", mnRom: "bi mongoloos irsen" },
  { group: "basics", en: "I'm from Korea", ko: "저는 한국에서 왔어요", koRom: "jeoneun hangugeseo wasseoyo", mn: "Би Солонгосоос ирсэн", mnRom: "bi solongosoos irsen" },
  { group: "basics", en: "I don't understand", ko: "이해가 안 돼요", koRom: "ihaega an dwaeyo", mn: "Би ойлгохгүй байна", mnRom: "bi oilgokhgüi baina" },
  { group: "basics", en: "Do you speak English?", ko: "영어 하실 수 있어요?", koRom: "yeongeo hasil su isseoyo?", mn: "Та англиар ярьдаг уу?", mnRom: "ta angliar yaridag uu?" },
  { group: "basics", en: "What's the Wi-Fi password?", ko: "와이파이 비밀번호가 뭐예요?", koRom: "waipai bimilbeonhoga mwoyeyo?", mn: "Wi-Fi-ийн нууц үг юу вэ?", mnRom: "wi-fi-iin nuuts üg yu ve?" },

  // Food
  { group: "food", en: "A table for two, please", ko: "두 명이요", koRom: "du myeong-iyo", mn: "Хоёр хүн", mnRom: "khoyor khün" },
  { group: "food", en: "The menu, please", ko: "메뉴판 주세요", koRom: "menyupan juseyo", mn: "Цэс өгнө үү", mnRom: "tses ögnö üü" },
  { group: "food", en: "Water, please", ko: "물 주세요", koRom: "mul juseyo", mn: "Ус өгнө үү", mnRom: "us ögnö üü" },
  { group: "food", en: "Not spicy, please", ko: "안 맵게 해 주세요", koRom: "an maepge hae juseyo", mn: "Битгий халуун ногоо хийгээрэй", mnRom: "bitgii khaluun nogoo khiigeerei" },
  { group: "food", en: "I'm vegetarian", ko: "저는 채식주의자예요", koRom: "jeoneun chaesikjuuijayeyo", mn: "Би цагаан хоолтон", mnRom: "bi tsagaan khooltan" },
  { group: "food", en: "It's delicious!", ko: "맛있어요!", koRom: "masisseoyo!", mn: "Амттай байна!", mnRom: "amttai baina!" },
  { group: "food", en: "The bill, please", ko: "계산해 주세요", koRom: "gyesanhae juseyo", mn: "Тооцоо бодоод өгөөч", mnRom: "tootsoo bodood ögööch" },
  { group: "food", en: "Cheers!", ko: "건배!", koRom: "geonbae!", mn: "Эрүүл мэндийн төлөө!", mnRom: "erüül mendiin tölöö!" },

  // Transport
  { group: "transport", en: "Where is …?", ko: "…어디예요?", koRom: "… eodiyeyo?", mn: "… хаана байна вэ?", mnRom: "… khaana baina ve?" },
  { group: "transport", en: "Where is the toilet?", ko: "화장실 어디예요?", koRom: "hwajangsil eodiyeyo?", mn: "Бие засах газар хаана байна вэ?", mnRom: "bie zasakh gazar khaana baina ve?" },
  { group: "transport", en: "Where is the bus stop?", ko: "버스 정류장이 어디예요?", koRom: "beoseu jeongnyujang-i eodiyeyo?", mn: "Автобусны буудал хаана байна вэ?", mnRom: "avtobusny buudal khaana baina ve?" },
  { group: "transport", en: "Please take me to this address", ko: "이 주소로 가 주세요", koRom: "i jusoro ga juseyo", mn: "Энэ хаяг руу явна уу", mnRom: "ene khayag ruu yavna uu" },
  { group: "transport", en: "Please stop here", ko: "여기서 세워 주세요", koRom: "yeogiseo sewo juseyo", mn: "Энд зогсоорой", mnRom: "end zogsooroi" },
  { group: "transport", en: "One ticket, please", ko: "표 한 장 주세요", koRom: "pyo han jang juseyo", mn: "Нэг тасалбар өгөөч", mnRom: "neg tasalbar ögööch" },
  { group: "transport", en: "I'm lost", ko: "길을 잃었어요", koRom: "gireul ireosseoyo", mn: "Би төөрчихлөө", mnRom: "bi töörchikhlöö" },

  // Shopping
  { group: "shopping", en: "How much is this?", ko: "이거 얼마예요?", koRom: "igeo eolmayeyo?", mn: "Энэ хэд вэ?", mnRom: "ene khed ve?" },
  { group: "shopping", en: "It's too expensive", ko: "너무 비싸요", koRom: "neomu bissayo", mn: "Хэтэрхий үнэтэй байна", mnRom: "kheterkhii ünetei baina" },
  { group: "shopping", en: "Can you give me a discount?", ko: "좀 깎아 주세요", koRom: "jom kkakka juseyo", mn: "Хямдруулж болох уу?", mnRom: "khyamdruulj bolokh uu?" },
  { group: "shopping", en: "Can I pay by card?", ko: "카드 돼요?", koRom: "kadeu dwaeyo?", mn: "Карт уншуулж болох уу?", mnRom: "kart unshuulj bolokh uu?" },

  // Emergency
  { group: "emergency", en: "Help!", ko: "도와주세요!", koRom: "dowajuseyo!", mn: "Туслаарай!", mnRom: "tuslaarai!" },
  { group: "emergency", en: "Please call the police", ko: "경찰을 불러 주세요", koRom: "gyeongchareul bulleo juseyo", mn: "Цагдаа дуудаарай", mnRom: "tsagdaa duudaarai" },
  { group: "emergency", en: "I need a doctor", ko: "의사가 필요해요", koRom: "uisaga piryohaeyo", mn: "Надад эмч хэрэгтэй байна", mnRom: "nadad emch kheregtei baina" },
  { group: "emergency", en: "Where is the hospital?", ko: "병원이 어디예요?", koRom: "byeongwoni eodiyeyo?", mn: "Эмнэлэг хаана байна вэ?", mnRom: "emneleg khaana baina ve?" },
  { group: "emergency", en: "Where is a pharmacy?", ko: "약국이 어디예요?", koRom: "yakgugi eodiyeyo?", mn: "Эмийн сан хаана байна вэ?", mnRom: "emiin san khaana baina ve?" },
];

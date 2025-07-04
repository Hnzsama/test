// Daftar prefix operator seluler Indonesia
const MOBILE_PREFIXES = [
  "62811", "62812", "62813", "62821", "62822", "62823", "62852", "62853",
  "62814", "62815", "62816", "62855", "62856", "62857", "62858",
  "62817", "62818", "62819", "62859", "62877", "62878", "62879",
  "62888", "62889", "62887", "62828",
  "62838", "62831", "62832", "62833",
  "62851"
];

// Generate nomor random dengan prefix Indonesia, panjang 11-13 digit, unik di session
export function generateUniqueIndoPhone(used: Set<string>): string {
  let tries = 0;
  let phone = "";
  do {
    const prefix = MOBILE_PREFIXES[Math.floor(Math.random() * MOBILE_PREFIXES.length)];
    const len = Math.floor(Math.random() * 3) + 7; // 7-9 digit
    let suffix = "";
    for (let i = 0; i < len; i++) {
      suffix += Math.floor(Math.random() * 10);
    }
    phone = "+" + prefix + suffix.slice(0, len);
    tries++;
    if (tries > 1000) throw new Error("Unable to generate unique phone number");
  } while (used.has(phone));
  return phone;
}

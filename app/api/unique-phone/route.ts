import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Valid Indonesian mobile prefixes including 62851
const MOBILE_PREFIXES = [
  // Telkomsel
  "62811", "62812", "62813", "62821", "62822", "62823", "62852", "62853",
  // Indosat
  "62814", "62815", "62816", "62855", "62856", "62857", "62858",
  // XL Axiata
  "62817", "62818", "62819", "62859", "62877", "62878", "62879",
  // Smartfren
  "62888", "62889", "62887", "62828",
  // Axis/XL
  "62838", "62831", "62832", "62833",
  // Added 851
  "62851"
];

function generateRandomPhoneNumber() {
  // Always use international format (62)
  const prefix = MOBILE_PREFIXES[Math.floor(Math.random() * MOBILE_PREFIXES.length)];
  
  // Determine length (10-12 digits total for the number part)
  const suffixLength = Math.floor(Math.random() * 3) + 7; // 7-9 digits
  
  // Generate the random number part
  let suffix = "";
  for (let i = 0; i < suffixLength; i++) {
    suffix += Math.floor(Math.random() * 10);
  }

  return prefix + suffix;
}

const usedNumbersPath = path.join(process.cwd(), "app", "worksheet", "used_numbers.json");

function ensureJsonFile() {
  if (!fs.existsSync(usedNumbersPath)) {
    fs.writeFileSync(usedNumbersPath, JSON.stringify([]));
  }
}

function getUsedNumbers() {
  ensureJsonFile();
  const data = fs.readFileSync(usedNumbersPath, "utf-8");
  return JSON.parse(data);
}

function addUsedNumber(number: string) {
  const used = getUsedNumbers();
  used.push(number);
  fs.writeFileSync(usedNumbersPath, JSON.stringify(used, null, 2));
}

function generateUniquePhoneNumber() {
  let tries = 0;
  let number = "";
  let used = getUsedNumbers();
  
  do {
    number = generateRandomPhoneNumber();
    tries++;
    if (tries > 100) {
      // Try cleaning duplicates before giving up
      used = Array.from(new Set(used));
      fs.writeFileSync(usedNumbersPath, JSON.stringify(used, null, 2));
      if (tries > 200) throw new Error("Unable to generate unique phone number");
    }
  } while (used.includes(number));
  
  addUsedNumber(number);
  return number;
}

export async function GET() {
  try {
    const phone = generateUniquePhoneNumber();
    // Debug log for production
    console.log("[FONNTE DEBUG] Generated phone:", phone);
    return NextResponse.json({ 
      phone,
      format: "international", // Always international now
      carrier: detectCarrier(phone),
      debug: phone // Add debug field for client-side inspection
    });
  } catch (error) {
    console.error("[FONNTE DEBUG] Error generating phone:", error);
    return NextResponse.json(
      { error: "Failed to generate phone number. Please try again." },
      { status: 500 }
    );
  }
}

function detectCarrier(phone: string): string {
  const prefix = phone.substring(0, 5); // Get first 5 digits (628xx)
  
  if (["62811", "62812", "62813", "62821", "62822", "62823", "62852", "62853"].includes(prefix)) {
    return "Telkomsel";
  }
  if (["62814", "62815", "62816", "62855", "62856", "62857", "62858"].includes(prefix)) {
    return "Indosat";
  }
  if (["62817", "62818", "62819", "62859", "62877", "62878", "62879"].includes(prefix)) {
    return "XL Axiata";
  }
  if (["62888", "62889", "62887", "62828"].includes(prefix)) {
    return "Smartfren";
  }
  if (["62838", "62831", "62832", "62833"].includes(prefix)) {
    return "Axis";
  }
  if (["62851"].includes(prefix)) {
    return "Telkomsel (851)";
  }
  return "Unknown";
}
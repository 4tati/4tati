import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ka' | 'en';

export const translations = {
  en: {
    appSlogan: "The premium digital identity for your best friend.",
    setupNewTag: "Setup a New Tag",
    settingUp: "Setting up...",
    orFindExisting: "Or find existing",
    tagIdOrUrl: "Tag ID or URL",
    yourPets: "Your Pets",
    pageNotFound: "We couldn't find the page you were looking for.",
    goHome: "Go Home",
    tagNotFoundTitle: "Tag Not Found",
    tagNotFoundDesc: "This tag hasn't been created yet or doesn't exist.",
    backToHome: "Back to Home",
    missingPet: "MISSING PET",
    navHome: "Home",
    navMedical: "Medical",
    navGallery: "Gallery",
    navOwner: "Owner",
    navPlay: "Play",
    speciesLabel: "Species",
    statusLabel: "Status",
    statusSecured: "Secured",
    ownerLogin: "Owner Login",
    medicalHistory: "Medical History",
    vaccinationsTitle: "Vaccinations",
    vaccinationsDesc: "Up to date. Last checked 2 months ago (Rabies, DHPP).",
    allergiesTitle: "Allergies",
    allergiesDesc: "Grains, Chicken. Requires specialized diet.",
    primaryVetTitle: "Primary Vet",
    primaryVetDesc: "Dr. Sarah Jenkins\n(555) 987-6543",
    galleryTitle: "Gallery",
    ownerContactTitle: "Owner Contact",
    lovingOwnerOf: "Loving owner of",
    petParent: "Pet Parent",
    playtimeTitle: "Playtime",
    playtimeDesc: "Keep {name} happy!",
    moodLabel: "Mood",
    treatBtn: "Treat",
    playBtn: "Play",
    ownerAccess: "Owner Access",
    enterPinDesc: "Enter the PIN you set when creating this tag.",
    incorrectPin: "Incorrect PIN",
    failedVerifyPin: "Failed to verify PIN. Please try again.",
    unlockProfile: "Unlock Profile",
    verifying: "Verifying...",
    welcomeTitle: "Welcome to 4Tati",
    welcomeDesc: "Let's create a beautiful digital profile for your pet.",
    petProfilePhoto: "Pet Profile Photo",
    aboutThem: "About Them",
    petsName: "Pet's Name *",
    speciesReq: "Species *",
    breed: "Breed",
    bioSpecialNeeds: "Bio / Special Needs",
    ownerContact: "Owner Contact",
    yourName: "Your Name",
    phoneNumber: "Phone Number *",
    secureProfile: "Secure Profile",
    secureProfileDesc: "Set a PIN to lock this profile. You'll need it later if you want to update these details.",
    createPinPlaceholder: "Create 4-8 digit PIN",
    createProfile: "Create Profile",
    saving: "Saving...",
    profileCreated: "Profile created and locked!",
    failedClaim: "Failed to claim tag. It might already be claimed.",
    editProfile: "Edit Profile",
    updatingTag: "Updating {name}'s tag",
    reportMissing: "Report Missing",
    reportMissingDesc: "Turn this on to display an emergency banner",
    petDetails: "Pet Details",
    ownerDetails: "Owner Details",
    saveChanges: "Save Changes",
    profileUpdated: "Profile updated successfully!",
    failedUpdate: "Failed to update profile. Please try again.",
    bannerActivated: "Emergency banner activated",
    bannerRemoved: "Emergency banner removed",
    unknown: "Unknown",
    placeholderName: "e.g. Bella",
    placeholderSpecies: "e.g. Dog, Cat",
    placeholderBreed: "e.g. Golden Retriever",
    placeholderBio: "e.g. Friendly but shy. Needs daily medication.",
    placeholderOwner: "e.g. Jane Doe",
    placeholderPhone: "e.g. (555) 123-4567",
    callOwnerCta: "Call the Owner",
    callBtn: "Call",
    whatsappBtn: "WhatsApp"
  },
  ka: {
    appSlogan: "თქვენი საუკეთესო მეგობრის პრემიუმ ციფრული იდენტობა.",
    setupNewTag: "ახალი თეგის შექმნა",
    settingUp: "იქმნება...",
    orFindExisting: "ან მოძებნეთ არსებული",
    tagIdOrUrl: "თეგის ID ან URL",
    yourPets: "თქვენი ცხოველები",
    pageNotFound: "გვერდი, რომელსაც ეძებთ, ვერ მოიძებნა.",
    goHome: "მთავარზე დაბრუნება",
    tagNotFoundTitle: "თეგი ვერ მოიძებნა",
    tagNotFoundDesc: "ეს თეგი ჯერ არ შექმნილა ან არ არსებობს.",
    backToHome: "მთავარზე დაბრუნება",
    missingPet: "დაიკარგა",
    navHome: "მთავარი",
    navMedical: "ჯანმრთელობა",
    navGallery: "გალერეა",
    navOwner: "პატრონი",
    navPlay: "თამაში",
    speciesLabel: "სახეობა",
    statusLabel: "სტატუსი",
    statusSecured: "დაცული",
    ownerLogin: "პატრონის ავტორიზაცია",
    medicalHistory: "სამედიცინო ისტორია",
    vaccinationsTitle: "ვაქცინაცია",
    vaccinationsDesc: "განახლებულია. ბოლო შემოწმება 2 თვის წინ (ცოფი, ჭირის კომპლექსი).",
    allergiesTitle: "ალერგიები",
    allergiesDesc: "მარცვლეული, ქათამი. ესაჭიროება სპეციალური დიეტა.",
    primaryVetTitle: "პირადი ვეტერინარი",
    primaryVetDesc: "ექიმი სარა ჯენკინსი\n(555) 987-6543",
    galleryTitle: "გალერეა",
    ownerContactTitle: "საკონტაქტო ინფო",
    lovingOwnerOf: "მოსიყვარულე პატრონი",
    petParent: "პატრონი",
    playtimeTitle: "თამაშის დრო",
    playtimeDesc: "გაახალისეთ {name}!",
    moodLabel: "განწყობა",
    treatBtn: "სასუსნავი",
    playBtn: "თამაში",
    ownerAccess: "პატრონის წვდომა",
    enterPinDesc: "შეიყვანეთ PIN, რომელიც თეგის შექმნისას მიუთითეთ.",
    incorrectPin: "არასწორი PIN",
    failedVerifyPin: "PIN კოდის შემოწმება ვერ მოხერხდა. სცადეთ თავიდან.",
    unlockProfile: "პროფილის განბლოკვა",
    verifying: "მოწმდება...",
    welcomeTitle: "კეთილი იყოს თქვენი მობრძანება 4Tati-ში",
    welcomeDesc: "მოდით, შევქმნათ თქვენი შინაური ცხოველის ლამაზი ციფრული პროფილი.",
    petProfilePhoto: "პროფილის სურათი",
    aboutThem: "ცხოველის შესახებ",
    petsName: "სახელი *",
    speciesReq: "სახეობა *",
    breed: "ჯიში",
    bioSpecialNeeds: "ბიოგრაფია / სპეციალური საჭიროებები",
    ownerContact: "პატრონის საკონტაქტო ინფო",
    yourName: "თქვენი სახელი",
    phoneNumber: "ტელეფონის ნომერი *",
    secureProfile: "უსაფრთხო პროფილი",
    secureProfileDesc: "დააყენეთ PIN კოდი პროფილის დასაბლოკად. ის დაგჭირდებათ მოგვიანებით მონაცემების გასანახლებლად.",
    createPinPlaceholder: "შექმენით 4-8 ნიშნა PIN",
    createProfile: "პროფილის შექმნა",
    saving: "ინახება...",
    profileCreated: "პროფილი შეიქმნა და დაიბლოკა!",
    failedClaim: "თეგის მითვისება ვერ მოხერხდა. შესაძლოა უკვე დაკავებულია.",
    editProfile: "პროფილის რედაქტირება",
    updatingTag: "მონაცემების განახლება: {name}",
    reportMissing: "დაკარგვის მონიშვნა",
    reportMissingDesc: "ჩართეთ ეს გადაუდებელი ბანერის საჩვენებლად",
    petDetails: "ცხოველის დეტალები",
    ownerDetails: "პატრონის დეტალები",
    saveChanges: "ცვლილებების შენახვა",
    profileUpdated: "პროფილი წარმატებით განახლდა!",
    failedUpdate: "პროფილის განახლება ვერ მოხერხდა. სცადეთ თავიდან.",
    bannerActivated: "გადაუდებელი ბანერი ჩართულია",
    bannerRemoved: "გადაუდებელი ბანერი გამორთულია",
    unknown: "უცნობია",
    placeholderName: "მაგ. ბელა",
    placeholderSpecies: "მაგ. ძაღლი, კატა",
    placeholderBreed: "მაგ. ოქროსფერი რეტრივერი",
    placeholderBio: "მაგ. მეგობრული, მაგრამ მორცხვი.",
    placeholderOwner: "მაგ. გიორგი",
    placeholderPhone: "მაგ. 555 12 34 56",
    callOwnerCta: "დაურეკე პატრონს",
    callBtn: "დარეკვა",
    whatsappBtn: "WhatsApp"
  }
};

export type Dictionary = typeof translations.en;
export type TranslationKey = keyof Dictionary;

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ka');

  useEffect(() => {
    const saved = localStorage.getItem('4tati_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ka')) {
      setLang(saved);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('4tati_lang', newLang);
  };

  const t = (key: TranslationKey, vars?: Record<string, string>): string => {
    let text = translations[lang]?.[key] || translations.en[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}

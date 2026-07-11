// Medical info is UI-only (mocked), stored per-pet in localStorage.
// There is no backend field for this yet; this keeps it editable from the
// owner's PIN-gated edit screen and readable from the public profile page.

export interface MedicalInfo {
  vaccinations: string;
  allergies: string;
  vetName: string;
  vetPhone: string;
}

const KEY_PREFIX = "pet_medical_";

export function getStoredMedical(petId: string): MedicalInfo | null {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${petId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      vaccinations: parsed.vaccinations || "",
      allergies: parsed.allergies || "",
      vetName: parsed.vetName || "",
      vetPhone: parsed.vetPhone || "",
    };
  } catch {
    return null;
  }
}

export function setStoredMedical(petId: string, info: MedicalInfo) {
  localStorage.setItem(`${KEY_PREFIX}${petId}`, JSON.stringify(info));
}

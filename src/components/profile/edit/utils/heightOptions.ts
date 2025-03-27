
// Generate height options (in cm and feet/inches)
export const generateHeightOptions = (): { value: string; label: string }[] => {
  const options = [];
  
  // Generate heights from 4'0" to 8'0"
  for (let feet = 4; feet <= 8; feet++) {
    for (let inches = 0; inches <= 11; inches++) {
      // For 8', only include 8'0"
      if (feet === 8 && inches > 0) break;
      
      const heightInInches = feet * 12 + inches;
      const heightInCm = Math.round(heightInInches * 2.54);
      
      options.push({
        value: `${feet}'${inches}" (${heightInCm}cm)`,
        label: `${feet}'${inches}" (${heightInCm}cm)`
      });
    }
  }
  
  return options;
};

export const heightOptions = generateHeightOptions();

import "dotenv/config";

export default {
  expo: {
    name: "cups",
    slug: "cups",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/cupsIcon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/cupsIcon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.mezerio.cups",
      adaptiveIcon: {
        foregroundImage: "./assets/cupsIcon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/cupsIcon.png",
    },
    owner: "maazvali",
    extra: {
      eas: {
        projectId: "9b290c1d-227f-4ff5-90f7-032e3eaaa9dd",
      },
    },
  },
};

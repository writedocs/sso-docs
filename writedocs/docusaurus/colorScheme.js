function defineColorScheme(configurations) {
  try {
    const { colorMode } = configurations;
    const { default: defaultMode, switchOff } = colorMode;
    return {
      respectPrefersColorScheme: false,
      defaultMode: defaultMode ? defaultMode : "light",
      disableSwitch: switchOff ? true : false,
    };
  } catch (error) {
    return {
      respectPrefersColorScheme: false,
      defaultMode: "light",
      disableSwitch: false,
    };
  }
}

export default defineColorScheme;

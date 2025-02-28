function defineBackground(images) {
  if (!images.background) {
    return {
      "--background-image": "transparent",
    };
  }

  const background = images.background.startsWith("/")
    ? images.background.slice(1)
    : images.background;
  return {
    "--background-image": `url("../../static/${background}")`,
  };
}

function defineBackgroundDark(images) {
  if (images.darkBackground === null) {
    return {
      "--background-image": "transparent",
    };
  }
  if (!images.darkBackground) {
    return defineBackground(images);
  }

  const background = images.darkBackground.startsWith("/")
    ? images.darkBackground.slice(1)
    : images.darkBackground;
  return {
    "--background-image": `url("../../static/${background}")`,
  };
}

module.exports = {
  defineBackground,
  defineBackgroundDark,
};

// announcementBar: {
//   id: 'support_us',
//   content:
//     'We are looking to revamp our docs, please fill <a target="_blank" rel="noopener noreferrer" href="#">this survey</a>',
//   backgroundColor: '#fafbfc',
//   textColor: '#091E42',
//   isCloseable: false,
// },

const defineAnnoucementBar = (config) => {
  if (config.banner) {
    const {
      banner: { backgroundColor, textColor, isCloseable, content },
    } = config;
    return {
      id: "banner",
      content,
      backgroundColor: backgroundColor || "#fafbfc",
      textColor: textColor || "#091E42",
      isCloseable: isCloseable || false,
    };
  }
};

export default defineAnnoucementBar;

/** Ant Design tokens mapped onto the brand palette (see tailwind.config.js). */
export const antTheme = {
  token: {
    colorPrimary: '#8F4A55',
    colorLink: '#8F4A55',
    colorSuccess: '#5E8C6A',
    colorWarning: '#C08A3E',
    colorError: '#B4505A',
    colorInfo: '#8F4A55',
    colorText: '#2F2A2C',
    colorTextSecondary: '#7A6D70',
    colorBorder: '#EADCD8',
    colorBorderSecondary: '#F1E6E3',
    colorBgLayout: '#FBF6F4',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    fontSize: 15,
    borderRadius: 10,
    controlHeight: 40,
  },
  components: {
    Layout: { siderBg: '#FFFFFF', headerBg: '#FFFFFF', bodyBg: '#FBF6F4' },
    Menu: { itemSelectedBg: '#F7E9E6', itemSelectedColor: '#8F4A55', itemBorderRadius: 10, itemMarginInline: 10 },
    Button: { fontWeight: 600 },
    Table: { headerBg: '#FBF6F4', headerColor: '#4A2C34', rowHoverBg: '#FDF8F7' },
    Card: { headerFontSize: 16 },
    Drawer: { colorBgElevated: '#FFFFFF' },
  },
};

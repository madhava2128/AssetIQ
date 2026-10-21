/**
 * AssetIQ — Single Source of Truth for Design Tokens
 * Deep frame, calm tinted content, and editorial typography
 */

export const TOKENS = {
    frame: {
        bg: '#15314B',
        hover: '#1D4062',
        selected: '#25507A',
        marker: '#8CC1F0',
        text: '#F1F5F9',
        textSecondary: '#B4C3D3',
        divider: '#2A4A68',
    },
    page: {
        bg: '#E6ECF2',
        header: '#DCE6F0',
    },
    panel: {
        bg: '#FFFFFF',
        header: '#F0F4F8',
        border: '#C9D4DF',
        borderStrong: '#AEBBC9',
        radius: '6px',
    },
    table: {
        header: '#E4EBF2',
        stripe: '#F7F9FB',
        hover: '#EAF1F8',
    },
    callout: {
        bg: '#DCE9F9',
    },
    text: {
        primary: '#14243A',
        secondary: '#41526A',
        muted: '#5F6F85',
    },
    accent: {
        default: '#1F66C2',
        hover: '#18539F',
        subtle: '#DCE9F9',
    },
    status: {
        ready: {
            text: '#1E7B4B',
            bg: '#E6F4EC',
            solid: '#2E9E63',
        },
        atRisk: {
            text: '#8A5300',
            bg: '#FDF1DC',
            solid: '#C27B0E',
        },
        notReady: {
            text: '#B42318',
            bg: '#FDECEA',
            solid: '#D64545',
        },
        neutral: {
            text: '#4B5563',
            bg: '#EEF0F3',
            solid: '#9AA3AF',
        },
    },
    chart: {
        accent: '#1F66C2',
        midBlue: '#6FA3DC',
        slateDark: '#8292A6',
        slateLight: '#C3CEDA',
        gridline: '#DDE5EC',
    },
    typography: {
        fontSans: 'var(--font-inter), Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
        fontSerif: 'var(--font-serif), "Source Serif 4", Georgia, Cambria, "Times New Roman", serif',
        scale: {
            pageTitle: { fontSize: '28px', fontWeight: '600', lineHeight: '1.25' },
            sectionHeading: { fontSize: '18px', fontWeight: '600', lineHeight: '1.4' },
            body: { fontSize: '15px', fontWeight: '400', lineHeight: '1.5' },
            table: { fontSize: '14px', fontWeight: '400', lineHeight: '1.45' },
            caption: { fontSize: '13px', fontWeight: '400', lineHeight: '1.4' },
            largeNumber: { fontSize: '36px', fontWeight: '600', lineHeight: '1.2' },
        },
    },
    // Backward compatibility aliases
    neutrals: {
        page: '#E6ECF2',
        panel: '#FFFFFF',
        subtle: '#F0F4F8',
        border: '#C9D4DF',
        borderStrong: '#AEBBC9',
        textPrimary: '#14243A',
        textSecondary: '#41526A',
        textMuted: '#5F6F85',
    },
} as const;

export default TOKENS;

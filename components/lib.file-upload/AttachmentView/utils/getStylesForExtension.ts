import { CSSProperties } from 'react';

export const getStylesForExtension = (extension: string): CSSProperties => {
    switch (extension) {
        case 'PDF': {
            return {
                backgroundColor: '#FF6666'
            };
        }
        case 'TXT': {
            return {
                backgroundColor: '#2FA2CE'
            };
        }
        case 'ZIP':
        case 'TAR':
        case 'GZ':
        case 'RAR':
        case '7Z': {
            return {
                backgroundColor: '#FF9A00'
            };
        }
        case 'WAV':
        case 'WMA':
        case 'MP3': {
            return {
                backgroundColor: '#3A92FD'
            };
        }
        case 'DOC':
        case 'DOCX': {
            return {
                backgroundColor: '#0077FF'
            };
        }
        case 'PPTX':
        case 'PPT': {
            return {
                backgroundColor: '#FF3333'
            };
        }
        case 'XLS':
        case 'XLSX':
        case 'CSV': {
            return {
                backgroundColor: '#008C33'
            };
        }
        case 'MP4':
        case 'AVI':
        case 'MOV':
        case 'FLV':
        case 'WMV': {
            return {
                backgroundColor: '#8F6CDC'
            };
        }
        case 'JPG':
        case 'JPEG':
        case 'PNG':
        case 'GIF':
        case 'PSD': {
            return {
                backgroundColor: '#000000',
                opacity: 0.8
            };
        }
        case 'HTML':
        case 'CSS':
        case 'DLL':
        case 'INI':
        case 'JS': {
            return {
                backgroundColor: '#0065D9'
            };
        }
        case 'EPUB':
        case 'MOBI':
        case 'DJVU': {
            return {
                backgroundColor: '#FFAE33'
            };
        }
        default: {
            return {
                backgroundColor: '#7F8285'
            };
        }
    }
};

/**
 * Validation utilities for CareBridge AI:
 * - Indian mobile number validation (valid starting digits: 6, 7, 8, 9; invalid starting digits: 0, 1, 2, 3, 4, 5).
 * - Email format validation and verification helpers.
 */

export interface MobileValidationResult {
  isValid: boolean;
  status: 'empty' | 'invalid_start' | 'incomplete' | 'valid' | 'too_long';
  digits: string;
  firstDigit: string;
  message: string;
  formatted: string;
}

export function validateIndianMobile(phone: string): MobileValidationResult {
  const raw = (phone || '').trim();
  let digits = raw.replace(/\D/g, '');

  // Strip international country code 91 if 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  if (!digits) {
    return {
      isValid: false,
      status: 'empty',
      digits: '',
      firstDigit: '',
      message: 'దయచేసి 10-అంకెల మొబైల్ నంబర్ నమోదు చేయండి (Please enter 10-digit mobile number).',
      formatted: ''
    };
  }

  const firstDigit = digits.charAt(0);

  // Check invalid starting digits: 0, 1, 2, 3, 4, 5
  if (['0', '1', '2', '3', '4', '5'].includes(firstDigit)) {
    return {
      isValid: false,
      status: 'invalid_start',
      digits,
      firstDigit,
      message: `చెల్లని మొబైల్ నంబర్! '${firstDigit}' తో ప్రారంభమైంది. భారతీయ మొబైల్ నంబర్లు 6, 7, 8, లేదా 9 తో మాత్రమే ప్రారంభం కావాలి (0, 1, 2, 3, 4, 5 చెల్లవు).`,
      formatted: digits
    };
  }

  // Check valid starting digits: 6, 7, 8, 9
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      status: 'invalid_start',
      digits,
      firstDigit,
      message: 'చెల్లని మొబైల్ నంబర్! మొబైల్ నంబర్ 6, 7, 8, లేదా 9 తో మాత్రమే ప్రారంభం కావాలి.',
      formatted: digits
    };
  }

  if (digits.length < 10) {
    return {
      isValid: false,
      status: 'incomplete',
      digits,
      firstDigit,
      message: `సరైన ప్రారంభ అంకె (${firstDigit})! ఇంకా ${10 - digits.length} అంకెలు నమోదు చేయండి (${digits.length}/10).`,
      formatted: `+91 ${digits}`
    };
  }

  if (digits.length > 10) {
    return {
      isValid: false,
      status: 'too_long',
      digits,
      firstDigit,
      message: `మొబైల్ నంబర్ 10 అంకెల కంటే ఎక్కువ ఉండకూడదు (ప్రస్తుతం: ${digits.length} అంకెలు).`,
      formatted: digits
    };
  }

  // Exactly 10 digits starting with 6, 7, 8, or 9
  return {
    isValid: true,
    status: 'valid',
    digits,
    firstDigit,
    message: `చెల్లుబాటు అయ్యే మొబైల్ నంబర్! (${firstDigit} తో ప్రారంభమైనది)`,
    formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  };
}

export interface EmailValidationResult {
  isValid: boolean;
  status: 'empty' | 'invalid_format' | 'valid';
  cleanEmail: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): EmailValidationResult {
  const clean = (email || '').trim();
  if (!clean) {
    return {
      isValid: false,
      status: 'empty',
      cleanEmail: '',
      message: 'దయచేసి ఈమెయిల్ చిరునామా నమోదు చేయండి (Email required before login).'
    };
  }

  if (!EMAIL_REGEX.test(clean)) {
    return {
      isValid: false,
      status: 'invalid_format',
      cleanEmail: clean,
      message: 'చెల్లని ఈమెయిల్ ఫార్మాట్! సరైన ఈమెయిల్ ఇవ్వండి (ఉదా: name@carebridge.org).'
    };
  }

  return {
    isValid: true,
    status: 'valid',
    cleanEmail: clean,
    message: 'సరైన ఈమెయిల్ చిరునామా ధృవీకరించబడింది.'
  };
}

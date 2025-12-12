/**
 * Trilingual Email Template System
 * All emails are sent in Polish, English, and German
 */

type Lang = 'pl' | 'en' | 'de';

// Supported languages constant
const SUPPORTED_LANGS: Lang[] = ['pl', 'en', 'de'];

// Common translations used across emails
const COMMON = {
  goToDeviation: {
    pl: 'Przejdź do odchylenia',
    en: 'Go to deviation',
    de: 'Zur Abweichung gehen',
  },
  goToRequest: {
    pl: 'Przejdź do wniosku',
    en: 'Go to request',
    de: 'Zum Antrag gehen',
  },
  area: {
    pl: 'Obszar',
    en: 'Area',
    de: 'Bereich',
  },
  deadline: {
    pl: 'Termin wykonania',
    en: 'Deadline',
    de: 'Frist',
  },
  actionDescription: {
    pl: 'Opis akcji',
    en: 'Action description',
    de: 'Aktionsbeschreibung',
  },
  comment: {
    pl: 'Komentarz',
    en: 'Comment',
    de: 'Kommentar',
  },
  approved: {
    pl: 'zatwierdzone',
    en: 'approved',
    de: 'genehmigt',
  },
  rejected: {
    pl: 'odrzucone',
    en: 'rejected',
    de: 'abgelehnt',
  },
  approval: {
    pl: 'zatwierdzenie',
    en: 'approval',
    de: 'Genehmigung',
  },
  created: {
    pl: 'Utworzono',
    en: 'Created',
    de: 'Erstellt',
  },
  edited: {
    pl: 'Edytowano',
    en: 'Edited',
    de: 'Bearbeitet',
  },
  general: {
    pl: 'Ogólny',
    en: 'General',
    de: 'Allgemein',
  },
} as const;

// Role translations
export const ROLE_TRANSLATIONS_TRILINGUAL = {
  group_leader: { pl: 'Group Leader', en: 'Group Leader', de: 'Gruppenleiter' },
  quality_manager: { pl: 'Kierownik Jakości', en: 'Quality Manager', de: 'Qualitätsleiter' },
  production_manager: { pl: 'Kierownik Produkcji', en: 'Production Manager', de: 'Produktionsleiter' },
  technology_manager: { pl: 'Kierownik Technologii', en: 'Technology Manager', de: 'Technologieleiter' },
  maintenance_manager: { pl: 'Kierownik Utrzymania Ruchu', en: 'Maintenance Manager', de: 'Instandhaltungsleiter' },
  plant_manager: { pl: 'Dyrektor Zakładu', en: 'Plant Manager', de: 'Werksleiter' },
  team_leader: { pl: 'Team Leader', en: 'Team Leader', de: 'Teamleiter' },
  logistics_manager: { pl: 'Kierownik Logistyki', en: 'Logistics Manager', de: 'Logistikleiter' },
} as const;

type RoleKey = keyof typeof ROLE_TRANSLATIONS_TRILINGUAL;

// Area translations for display
const AREA_TRANSLATIONS: Record<string, Record<Lang, string>> = {
  coating: { pl: 'POWLEKANIE', en: 'COATING', de: 'BESCHICHTUNG' },
};

// Helper to get translated area
const getAreaDisplay = (area: string, lang: Lang): string => {
  const translated = AREA_TRANSLATIONS[area.toLowerCase()]?.[lang];
  return translated || area.toUpperCase();
};

// Helper to get translated role
export const getTranslatedRole = (role: string, lang: Lang): string => {
  const translations = ROLE_TRANSLATIONS_TRILINGUAL[role as RoleKey];
  return translations?.[lang] || role;
};

// Styling constants
const STYLES = {
  button: `display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;`,
  warning: `color: red; font-weight: bold;`,
  warningOrange: `color: orange; font-weight: bold;`,
  separator: `border: none; border-top: 1px solid #ccc; margin: 20px 0;`,
  langHeader: `font-size: 12px; color: #666; margin-bottom: 5px;`,
  section: `margin-bottom: 25px;`,
};

// Button component
const button = (url: string, text: Record<Lang, string>, lang: Lang): string =>
  `<a href="${url}" style="${STYLES.button}">${text[lang]}</a>`;

// Language section wrapper
const langSection = (lang: Lang, content: string): string => {
  const flags: Record<Lang, string> = { pl: '🇵🇱', en: '🇬🇧', de: '🇩🇪' };
  const names: Record<Lang, string> = { pl: 'Polski', en: 'English', de: 'Deutsch' };
  return `
    <div style="${STYLES.section}">
      <div style="${STYLES.langHeader}">${flags[lang]} ${names[lang]}</div>
      ${content}
    </div>
  `;
};

// Build trilingual email content
const buildTrilingualEmail = (
  contentBuilder: (lang: Lang) => string
): string => {
  return `
    <div style="font-family: sans-serif; max-width: 600px;">
      ${SUPPORTED_LANGS.map((lang, i) =>
        langSection(lang, contentBuilder(lang)) +
        (i < SUPPORTED_LANGS.length - 1 ? `<hr style="${STYLES.separator}" />` : '')
      ).join('')}
    </div>
  `;
};

// ============================================
// DEVIATION EMAIL TEMPLATES
// ============================================

interface DeviationBaseParams {
  internalId: string;
  deviationUrl: string;
  isEdit?: boolean;
}

interface DeviationRoleNotificationParams extends DeviationBaseParams {
  role: string;
  area?: string | null;
}

export const deviationRoleNotification = ({
  internalId,
  deviationUrl,
  role,
  area,
  isEdit = false,
}: DeviationRoleNotificationParams) => {
  const subject = {
    pl: `Odchylenie [${internalId}] - wymagane zatwierdzenie (${getTranslatedRole(role, 'pl')})`,
    en: `Deviation [${internalId}] - approval required (${getTranslatedRole(role, 'en')})`,
    de: `Abweichung [${internalId}] - Genehmigung erforderlich (${getTranslatedRole(role, 'de')})`,
  };

  const html = buildTrilingualEmail((lang) => {
    const action = isEdit ? COMMON.edited[lang] : COMMON.created[lang];
    const roleTranslated = getTranslatedRole(role, lang);
    const areaText = area?.toUpperCase() || COMMON.general[lang];

    const messages: Record<Lang, string> = {
      pl: `${action} odchylenie [${internalId}] - wymagane zatwierdzenie przez: ${roleTranslated}.`,
      en: `${action} deviation [${internalId}] - approval required by: ${roleTranslated}.`,
      de: `${action} Abweichung [${internalId}] - Genehmigung erforderlich durch: ${roleTranslated}.`,
    };

    return `
      <p>${messages[lang]}</p>
      <p>${COMMON.area[lang]}: ${areaText}</p>
      <p>${button(deviationUrl, COMMON.goToDeviation, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface DeviationVacancyNotificationParams extends DeviationBaseParams {
  vacantRole: string;
}

export const deviationVacancyNotification = ({
  internalId,
  deviationUrl,
  vacantRole,
  isEdit = false,
}: DeviationVacancyNotificationParams) => {
  const vacantRoleTranslated = (lang: Lang) => getTranslatedRole(vacantRole, lang);

  const subject = {
    pl: `Odchylenie [${internalId}] - wymagane zatwierdzenie (wakat - ${vacantRoleTranslated('pl')})`,
    en: `Deviation [${internalId}] - approval required (vacancy - ${vacantRoleTranslated('en')})`,
    de: `Abweichung [${internalId}] - Genehmigung erforderlich (Vakanz - ${vacantRoleTranslated('de')})`,
  };

  const html = buildTrilingualEmail((lang) => {
    const action = isEdit ? COMMON.edited[lang] : COMMON.created[lang];

    const messages: Record<Lang, string> = {
      pl: `${action} odchylenie [${internalId}] - wymagane zatwierdzenie.`,
      en: `${action} deviation [${internalId}] - approval required.`,
      de: `${action} Abweichung [${internalId}] - Genehmigung erforderlich.`,
    };

    const warnings: Record<Lang, string> = {
      pl: `Powiadomienie wysłano do Dyrektora Zakładu z powodu wakatu na stanowisku: ${vacantRoleTranslated(lang)}.`,
      en: `Notification sent to Plant Manager due to vacancy at position: ${vacantRoleTranslated(lang)}.`,
      de: `Benachrichtigung an Werksleiter gesendet wegen Vakanz auf Position: ${vacantRoleTranslated(lang)}.`,
    };

    return `
      <p>${messages[lang]}</p>
      <p style="${STYLES.warning}">${warnings[lang]}</p>
      <p>${button(deviationUrl, COMMON.goToDeviation, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface DeviationNoGroupLeaderParams extends DeviationBaseParams {
  area: string;
}

export const deviationNoGroupLeaderNotification = ({
  internalId,
  deviationUrl,
  area,
  isEdit = false,
}: DeviationNoGroupLeaderParams) => {
  const subject = {
    pl: `Odchylenie [${internalId}] - wymagane zatwierdzenia (wakat Group Leader)`,
    en: `Deviation [${internalId}] - approval required (Group Leader vacancy)`,
    de: `Abweichung [${internalId}] - Genehmigung erforderlich (Gruppenleiter Vakanz)`,
  };

  const html = buildTrilingualEmail((lang) => {
    const action = isEdit ? COMMON.edited[lang] : COMMON.created[lang];
    const areaUpper = area?.toUpperCase();

    const messages: Record<Lang, string> = {
      pl: `${action} odchylenie [${internalId}] w obszarze ${areaUpper}, które wymaga zatwierdzenia.`,
      en: `${action} deviation [${internalId}] in area ${areaUpper}, which requires approval.`,
      de: `${action} Abweichung [${internalId}] im Bereich ${areaUpper}, die Genehmigung erfordert.`,
    };

    const warnings: Record<Lang, string> = {
      pl: `Powiadomienie wysłano do Dyrektora Zakładu z powodu braku przypisanego: Group Leadera (${areaUpper}).`,
      en: `Notification sent to Plant Manager due to missing: Group Leader (${areaUpper}).`,
      de: `Benachrichtigung an Werksleiter gesendet wegen fehlendem: Gruppenleiter (${areaUpper}).`,
    };

    return `
      <p>${messages[lang]}</p>
      <p style="${STYLES.warningOrange}">${warnings[lang]}</p>
      <p>${button(deviationUrl, COMMON.goToDeviation, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface CorrectiveActionAssignmentParams {
  internalId: string;
  deviationUrl: string;
  description: string;
  deadline: string;
}

export const correctiveActionAssignmentNotification = ({
  internalId,
  deviationUrl,
  description,
  deadline,
}: CorrectiveActionAssignmentParams) => {
  const subject = {
    pl: `Przypisano akcję korygującą w odchyleniu [${internalId}]`,
    en: `Corrective action assigned in deviation [${internalId}]`,
    de: `Korrekturmaßnahme zugewiesen in Abweichung [${internalId}]`,
  };

  const html = buildTrilingualEmail((lang) => {
    const messages: Record<Lang, string> = {
      pl: `Zostałeś/aś wyznaczony/a jako osoba odpowiedzialna za wykonanie akcji korygującej w odchyleniu [${internalId}].`,
      en: `You have been assigned as the person responsible for completing a corrective action in deviation [${internalId}].`,
      de: `Sie wurden als verantwortliche Person für die Durchführung einer Korrekturmaßnahme in Abweichung [${internalId}] bestimmt.`,
    };

    return `
      <p>${messages[lang]}</p>
      <p><strong>${COMMON.actionDescription[lang]}:</strong> ${description}</p>
      <p><strong>${COMMON.deadline[lang]}:</strong> ${deadline}</p>
      <p>${button(deviationUrl, COMMON.goToDeviation, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface RejectionReevaluationParams {
  internalId: string;
  deviationUrl: string;
  reason: 'corrective_action' | 'attachment';
}

export const rejectionReevaluationNotification = ({
  internalId,
  deviationUrl,
  reason,
}: RejectionReevaluationParams) => {
  const subject = {
    pl: `Odchylenie [${internalId}] - aktualizacja (wymaga ponownej weryfikacji)`,
    en: `Deviation [${internalId}] - update (requires re-verification)`,
    de: `Abweichung [${internalId}] - Aktualisierung (erfordert erneute Überprüfung)`,
  };

  const html = buildTrilingualEmail((lang) => {
    const reasonTexts: Record<typeof reason, Record<Lang, string>> = {
      corrective_action: {
        pl: 'dodano nową akcję korygującą',
        en: 'a new corrective action was added',
        de: 'eine neue Korrekturmaßnahme wurde hinzugefügt',
      },
      attachment: {
        pl: 'dodano nowy załącznik',
        en: 'a new attachment was added',
        de: 'ein neuer Anhang wurde hinzugefügt',
      },
    };

    const messages: Record<Lang, string> = {
      pl: `W odchyleniu [${internalId}], które wcześniej odrzuciłeś/aś, ${reasonTexts[reason][lang]}.`,
      en: `In deviation [${internalId}], which you previously rejected, ${reasonTexts[reason][lang]}.`,
      de: `In Abweichung [${internalId}], die Sie zuvor abgelehnt haben, ${reasonTexts[reason][lang]}.`,
    };

    return `
      <p>${messages[lang]}</p>
      <p>${button(deviationUrl, COMMON.goToDeviation, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface ApprovalDecisionParams {
  internalId: string;
  deviationUrl: string;
  decision: 'approved' | 'rejected';
  approverEmail: string;
  approverRole: string;
  comment?: string | null;
}

export const approvalDecisionNotification = ({
  internalId,
  deviationUrl,
  decision,
  approverEmail,
  approverRole,
  comment,
}: ApprovalDecisionParams) => {
  const decisionText = (lang: Lang) => COMMON[decision][lang];
  const roleTranslated = (lang: Lang) => getTranslatedRole(approverRole, lang);
  const approverName = extractNameFromEmail(approverEmail);

  const subject = {
    pl: `Odchylenie [${internalId}] zostało ${decisionText('pl')}`,
    en: `Deviation [${internalId}] was ${decisionText('en')}`,
    de: `Abweichung [${internalId}] wurde ${decisionText('de')}`,
  };

  const html = buildTrilingualEmail((lang) => {
    const messages: Record<Lang, string> = {
      pl: `Twoje odchylenie [${internalId}] zostało ${decisionText(lang)} przez ${approverName} (${roleTranslated(lang)}).`,
      en: `Your deviation [${internalId}] was ${decisionText(lang)} by ${approverName} (${roleTranslated(lang)}).`,
      de: `Ihre Abweichung [${internalId}] wurde ${decisionText(lang)} von ${approverName} (${roleTranslated(lang)}).`,
    };

    const commentSection = decision === 'rejected' && comment
      ? `<p><strong>${COMMON.comment[lang]}:</strong> ${comment}</p>`
      : '';

    return `
      <p>${messages[lang]}</p>
      ${commentSection}
      <p>${button(deviationUrl, COMMON.goToDeviation, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface PrintImplementationParams {
  internalId: string;
  deviationUrl: string;
  area: string;
}

export const printImplementationNotification = ({
  internalId,
  deviationUrl,
  area,
}: PrintImplementationParams) => {
  const subject = {
    pl: `Odchylenie [${internalId}] wymaga wydruku i wdrożenia`,
    en: `Deviation [${internalId}] requires printing and implementation`,
    de: `Abweichung [${internalId}] erfordert Druck und Umsetzung`,
  };

  const html = buildTrilingualEmail((lang) => {
    const areaDisplay = getAreaDisplay(area, lang);

    const messages: Record<Lang, string> = {
      pl: `Odchylenie [${internalId}] zostało zatwierdzone - wymaga wydruku i wdrożenia na: ${areaDisplay}`,
      en: `Deviation [${internalId}] has been approved - requires printing and implementation at: ${areaDisplay}`,
      de: `Abweichung [${internalId}] wurde genehmigt - erfordert Druck und Umsetzung bei: ${areaDisplay}`,
    };

    return `
      <p>${messages[lang]}</p>
      <p>${button(deviationUrl, COMMON.goToDeviation, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface PlantManagerFinalApprovalParams {
  internalId: string;
  deviationUrl: string;
}

export const plantManagerFinalApprovalNotification = ({
  internalId,
  deviationUrl,
}: PlantManagerFinalApprovalParams) => {
  const subject = {
    pl: `Odchylenie [${internalId}] - wymaga decyzji Dyrektora Zakładu`,
    en: `Deviation [${internalId}] - requires Plant Manager decision`,
    de: `Abweichung [${internalId}] - erfordert Entscheidung des Werksleiters`,
  };

  const html = buildTrilingualEmail((lang) => {
    const messages: Record<Lang, string> = {
      pl: `Wszystkie stanowiska zatwierdziły odchylenie [${internalId}], czeka na decyzję Dyrektora Zakładu.`,
      en: `All positions have approved deviation [${internalId}], awaiting Plant Manager decision.`,
      de: `Alle Positionen haben Abweichung [${internalId}] genehmigt, wartet auf Entscheidung des Werksleiters.`,
    };

    return `
      <p>${messages[lang]}</p>
      <p>${button(deviationUrl, COMMON.goToDeviation, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

// ============================================
// OVERTIME EMAIL TEMPLATES
// ============================================

// Common button text for overtime
const OVERTIME_BUTTONS = {
  openOrder: {
    pl: 'Otwórz zlecenie',
    en: 'Open order',
    de: 'Auftrag öffnen',
  },
  openSubmission: {
    pl: 'Otwórz zgłoszenie',
    en: 'Open submission',
    de: 'Meldung öffnen',
  },
};

interface OvertimeOrderApprovalParams {
  requestUrl: string;
}

export const overtimeOrderApprovalNotification = ({
  requestUrl,
}: OvertimeOrderApprovalParams) => {
  const subject = {
    pl: 'Zatwierdzone zlecanie wykonania pracy w godzinach nadliczbowych',
    en: 'Approved overtime work order',
    de: 'Genehmigter Überstundenarbeitsauftrag',
  };

  const html = buildTrilingualEmail((lang) => {
    const messages: Record<Lang, string> = {
      pl: 'Twoje zlecenie wykonania pracy w godzinach nadliczbowych zostało zatwierdzone.',
      en: 'Your overtime work order has been approved.',
      de: 'Ihr Überstundenarbeitsauftrag wurde genehmigt.',
    };

    return `
      <p>${messages[lang]}</p>
      <p>${button(requestUrl, OVERTIME_BUTTONS.openOrder, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface OvertimeSubmissionRejectionParams {
  requestUrl: string;
  reason?: string | null;
}

export const overtimeSubmissionRejectionNotification = ({
  requestUrl,
  reason,
}: OvertimeSubmissionRejectionParams) => {
  const subject = {
    pl: 'Odrzucone nadgodziny',
    en: 'Rejected overtime',
    de: 'Abgelehnte Überstunden',
  };

  const html = buildTrilingualEmail((lang) => {
    const messages: Record<Lang, string> = {
      pl: 'Twoje zgłoszenie nadgodzin zostało odrzucone.',
      en: 'Your overtime submission has been rejected.',
      de: 'Ihre Überstundenmeldung wurde abgelehnt.',
    };

    const reasonLabel: Record<Lang, string> = {
      pl: 'Powód odrzucenia',
      en: 'Rejection reason',
      de: 'Ablehnungsgrund',
    };

    const reasonSection = reason
      ? `<p><strong>${reasonLabel[lang]}:</strong> ${reason}</p>`
      : '';

    return `
      <p>${messages[lang]}</p>
      ${reasonSection}
      <p>${button(requestUrl, OVERTIME_BUTTONS.openSubmission, lang)}</p>
    `;
  });

  return { subject: subject.pl, html };
};

interface OvertimeSubmissionApprovalParams {
  requestUrl: string;
  stage: 'supervisor' | 'final';
}

export const overtimeSubmissionApprovalNotification = ({
  requestUrl,
  stage,
}: OvertimeSubmissionApprovalParams) => {
  const subjects: Record<'supervisor' | 'final', Record<Lang, string>> = {
    supervisor: {
      pl: 'Nadgodziny zatwierdzone przez przełożonego',
      en: 'Overtime approved by supervisor',
      de: 'Überstunden vom Vorgesetzten genehmigt',
    },
    final: {
      pl: 'Zatwierdzone nadgodziny',
      en: 'Approved overtime',
      de: 'Genehmigte Überstunden',
    },
  };

  const html = buildTrilingualEmail((lang) => {
    const messages: Record<typeof stage, Record<Lang, string>> = {
      supervisor: {
        pl: 'Twoje zgłoszenie nadgodzin zostało zatwierdzone przez przełożonego i oczekuje na zatwierdzenie przez Plant Managera.',
        en: 'Your overtime submission has been approved by supervisor and awaits Plant Manager approval.',
        de: 'Ihre Überstundenmeldung wurde vom Vorgesetzten genehmigt und wartet auf die Genehmigung des Werksleiters.',
      },
      final: {
        pl: 'Twoje zgłoszenie nadgodzin zostało zatwierdzone!',
        en: 'Your overtime submission has been approved!',
        de: 'Ihre Überstundenmeldung wurde genehmigt!',
      },
    };

    return `
      <p>${messages[stage][lang]}</p>
      <p>${button(requestUrl, OVERTIME_BUTTONS.openSubmission, lang)}</p>
    `;
  });

  return { subject: subjects[stage].pl, html };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function extractNameFromEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const localPart = email.split('@')[0] || '';
  if (!localPart) return email;
  return (
    localPart
      .split('.')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || email
  );
}

// Export utilities
export { buildTrilingualEmail, COMMON, STYLES, button, extractNameFromEmail };

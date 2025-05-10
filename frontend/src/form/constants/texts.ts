// src/constants/texts.ts

export const userAreaTexts = {
  // Organized by form component first, then by element type
  personalDetailsForm: {
    missionBriefing: "Bitte gib deine Kontaktinformationen für die Festival-Registrierung ein.",
    footerId: "WWWW-CREW-REGISTRATION // ID-2025",
    title: "Persönliche Daten",
    subtitle: "Do, 28.08. - So, 31.08.2025"
  },

  ticketSelectionForm: {
    missionBriefing: "Wähle die Tage aus, an denen du am Festival teilnehmen möchtest. Sonntag ist Abbautag.",
    footerId: "WWWW-MISSION-CONTROL // ID-2025",
    title: "Wann fliegst du mit?"
  },

  beverageSelectionForm: {
    missionBriefing: "Auf dem Festival steht eine frei zugängliche Zapfanlage, an der du dich für den gewählten Zeitraum bedienen kannst.",
    footerId: "WWWW-BEVERAGE-STATION // ID-2025",
    title: "Ein Spacebier gefällig?",
    noBeverage: "Kein Bier für mich"
  },

  foodSelectionForm: {
    missionBriefing: "Bestell deine abendliche Astronautenkost bei uns vor. Wähle aus unseren galaktischen Spezialitäten!",
    footerId: "WWWW-FOOD-STATION // ID-2025",
    title: "Wähle deine Astronautenkost",
    noFood: "Kein Essen für mich"
  },

  workshiftsForm: {
    missionBriefing: "Wähle deine bevorzugten Supportschichten, um der Raumstation zu helfen. Wähle drei Prioritäten.\n\nNeben jeder Schicht stehen zwei Zahlen. Die erste zeigt, wie viele Astronaut:innen schon dabei, die zweite wie viele wir insgesamt brauchen.",
    footerId: "WWWW-CREW-ASSIGNMENTS // ID-2025",
    title: "Tritt der Crew bei",
    crewPartner: "Crew Partner:in",
    crewPartnerDescription: "Mit wem möchtest du zusammen arbeiten?",
    shiftsCountTitle: "Anzahl der Schichten",
    shiftsCountHelperText: "Wähle, ob du eine, zwei oder drei Schichten übernehmen möchtest. Anhand deiner Prioritäten bekommst du dann mehrere Schichten zugeteilt.",
    availableShifts: "Verfügbare Schichten"
  },

  materialsForm: {
    missionBriefing: "Deine Unterstützung hilft uns, das Festival zu einem unvergesslichen Erlebnis zu machen. Bitte wähle aus was du zu unserer interstellaren Expedition mitbringen kannst.",
    footerId: "WWWW-CARGO-MANIFEST // ID-2025",
    title: "Ich bringe folgende Ersatzteile mit",
    materialsTitle: "Mitzubringende Materialien",
    bringingItems: (count: number) => `Du bringst ${count} ${count === 1 ? 'Gegenstand' : 'Gegenstände'} mit`
  },

  awarenessCodeForm: {
    missionBriefing: "Für ein gelungenes Festival ist es wichtig, dass wir alle aufeinander achten und respektvoll miteinander umgehen. Unser Awareness-Code hilft uns, eine sichere und angenehme Atmosphäre für alle zu schaffen.",
    footerId: "WWWW-CREW-CODEX // ID-2025",
    title: "Ein paar Regeln für unsere Reise durch die Galaxis",
    codeRules: [
      {
        title: "Achtsamkeit, Verantwortung und Fürsorge",
        text: "Alle sollen sich wohlfühlen. Sei rücksichtsvoll mit dir und anderen. Achte auf deine Bedürfnisse (Wasser, Schlaf, Essen, Ruhe) und respektiere deine Konsumgrenzen. Frage nach, ob es anderen gut geht, und gehe sorgfältig mit Dingen und der Natur um. Sollest du das Festivalgelände verlassen, informiere deine Freund*innen darüber."
      },
      {
        title: "Keine Diskriminierung",
        text: "Sexismus, Rassismus, Queerfeindlichkeit und Gewalt führen zum Ausschluss. Wir setzen uns für Antidiskriminierung und Vielfalt ein."
      },
      {
        title: "Respektiere Grenzen / Konsensprinzip",
        text: 'Achte auf Konsens – nur "Ja heißt ja"!, Vielleicht heißt nicht ja" und "Nichts sagen" heißt nicht ja. Jede:r hat unterschiedliche Grenzen, daher müssen diese immer erfragt und respektiert werden.'
      },
      {
        title: "Parteilichkeit bei Grenzüberschreitungen",
        text: "Betroffene entscheiden, was eine Grenzüberschreitung ist. Wir solidarisieren uns mit der betroffenen Person und glauben ihrer Darstellung der Situation."
      },
      {
        title: "Umgang mit Bildern und Fotos",
        text: "Frag immer, bevor du Fotos machst, besonders bei sensiblen Inhalten. Teile keine sensiblen Fotos ohne Zustimmung."
      },
      {
        title: "Geschlechtergerechte Sprache",
        text: "Wir möchten eine geschlechterneutrale und inklusive Sprache verwenden. Alle Menschen sollen unabhängig von ihrer Gender-Identität angesprochen werden. Frage nach den Pronomen oder benutze den Namen, statt ein Pronomen zu verwenden."
      }
    ]
  },

  signatureForm: {
    missionBriefing: "Vor Beginn deiner interstellaren Reise bestätige bitte die Sicherheitshinweise mit deiner digitalen Signatur.",
    footerId: "WWWW-AUTHORIZATION-PROTOCOL // ID-2025",
    title: "Ein Abenteuer auf eigene Gefahr",
    legalTitle: "Bestätigung der Teilnahmebedingungen",
    legalText: "Hiermit bestätige ich, dass ich auf eigene Gefahr am 'Weiher Wald und Weltall-Wahn 2025' vom 28.08.2025 bis zum 31.08.2025 teilnehme. Der Veranstalter haftet bei Personen-, Sach- und Vermögensschäden nicht für leichte Fahrlässigkeit. Dies gilt sowohl für eigene Handlungen, als auch für Handlungen seiner Vertreter, Erfüllungsgehilfen oder Dritter, derer sich der Veranstalter im Zusammenhang mit der Durchführung der Veranstaltung bedient.",
    signatureTitle: "Deine Unterschrift",
    validationError: "Wir würden uns freuen, wenn du das Formular unterschreibst"
  },

  summaryForm: {
    missionBriefing: "Überprüfe deine Reisedaten und Einsatzdetails vor dem Start. Alle Systeme bereit für Countdown.",
    footerId: "WWWW-MISSION-SUMMARY // ID-2025",
    title: "Zusammenfassung",
    missionContribution: "Missionsbeitrag",
    personalData: "Persönliche Daten",
    participationOption: "Teilnahmeoption",
    catering: "Verpflegung",
    beverageTitle: "Bierflatrate",
    foodTitle: "Essensauswahl",
    deploymentPlan: "Einsatzplan",
    supportPriorities: "Deine Support-Prioritäten:",
    supportInfo: "Support-Informationen",
    supportBuddy: "Supporter Buddy",
    noSupportBuddy: "Kein Buddy angegeben",
    shiftsCount: "Anzahl Schichten",
    equipment: "Ausrüstung",
    bringingItems: "Ich bringe mit:",
    noMaterialsSelected: "Keine Materialien ausgewählt"
  },

  confirmationForm: {
    initialView: {
      missionBriefing: "Bereit für den Start! Bitte bestätige deine Teilnahme durch Absenden der Buchung.",
      footerId: "WWWW-LAUNCH-SEQUENCE // ID-2025",
      title: "Bereit zum Abheben!",
      subtitle: "Wir freuen uns, dass du beim Weiher Wald und Weltall-Wahn dabei sein möchtest! Mit dem Absenden der Buchung reservierst du deinen Platz beim Festival.",
      totalContribution: "Dein Gesamtbeitrag:",
      submitButton: "Buchung absenden",
      offlineWarning: "Du bist momentan offline. Bitte stelle eine Internetverbindung her, bevor du deine Buchung absendest.",
      errorMessage: "Es gab ein Problem beim Absenden der Buchung. Bitte versuche es erneut oder kontaktiere den Support.",
      paymentNote: "Du kannst deine Buchung später noch bezahlen."
    },

    successView: {
      missionBriefing: "Deine Registrierung für das Weiher Wald & Weltall-Wahn war erfolgreich! Bitte bestätige jetzt deine Teilnahme durch Zahlung.",
      footerId: "WWWW-BOOKING-CONFIRMATION // ID-2025",
      title: "Deine Buchung war erfolgreich!",
      subtitle: "Du erhältst in Kürze eine Bestätigungsmail mit allen Details zu deiner Buchung. Bitte prüfe auch deinen Spam-Ordner, falls die Mail nicht sofort ankommt.",
      footer: "Wir freuen uns auf dich beim Weiher Wald und Weltall-Wahn!"
    },

    errorView: {
      missionBriefing: "Wir haben ein Problem mit deiner Registrierung. Bitte versuche es erneut oder kontaktiere uns.",
      footerId: "WWWW-ERROR-RECOVERY // ID-2025",
      title: "Buchung fehlgeschlagen",
      subtitle: "Leider konnte deine Buchung nicht abgeschlossen werden. Das kann verschiedene Gründe haben:",
      reasons: [
        "Netzwerkprobleme oder Serverüberlastung",
        "Probleme bei der Datenverarbeitung",
        "Technische Schwierigkeiten im System"
      ],
      contactInfo: "Bitte kontaktiere Christian Hauptmann per E-Mail oder Telefon, um deine Buchung manuell abzuschließen.",
      retryButton: "Erneut versuchen"
    },

    paymentInfo: {
      title: "Zahlungsinformationen",
      instructionsSubject: "Bitte verwende diesen Betreff für deine Überweisung:",
      subjectHelp: "Der Betreff hilft uns, deine Zahlung korrekt zuzuordnen.",
      paypalButton: "Jetzt mit PayPal bezahlen",
      alternativePayment: "Kein PayPal? Kontaktiere bitte direkt Stephan Hauptmann für alternative Zahlungsmöglichkeiten."
    },

    redirectModal: {
      title: "Betreff wurde kopiert",
      subtitle: "Bitte füge den Betreff in deine PayPal-Überweisung ein, damit wir deine Zahlung zuordnen können.",
      redirectText: (seconds: number) => `Weiterleitung zu PayPal in ${seconds} Sekunden...`,
      manualRedirectText: "Du wurdest nicht weitergeleitet?",
      manualRedirectButton: "Manuell zu PayPal"
    }
  }
};
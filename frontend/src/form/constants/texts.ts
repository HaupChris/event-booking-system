export const userAreaTexts = {
    // Organized by form component first, then by element type
    personalDetailsForm: {
        missionBriefing: "Bitte gib deine Kontaktinformationen für die Festival-Registrierung ein.",
        footerId: "WWWW-CREW-REGISTRATION // ID-2025",
        title: "Persönliche Daten",
        subtitle: "Do, 28.08. - So, 31.08.2025",
        professionsTitle: "Berufliche Qualifikationen",
        professionsSubtitle: "Wähle alle Qualifikationen aus, die auf dich zutreffen. Diese Angaben sind freiwillig und helfen uns, im Notfall schnell die richtigen Personen zu finden.",
        selectedProfessions: (count: number) => `Du hast ${count} ${count === 1 ? 'Qualifikation' : 'Qualifikationen'} ausgewählt`,
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
        noMaterialsSelected: "Keine Materialien ausgewählt",
        professionsTitle: "Berufliche Qualifikationen",
        noProfessionsSelected: "Keine beruflichen Qualifikationen angegeben",
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

export const artistAreaTexts = {
    personalDetailsForm: {
        missionBriefing: "Bitte gib deine Kontaktinformationen für die Künstler*innen-Registrierung ein.",
        footerId: "WWWW-ARTIST-REGISTRATION // ID-2025",
        title: "Artist-Daten",
        subtitle: "Do, 28.08. - So, 31.08.2025",
        professionsTitle: "Berufliche Qualifikationen",
        professionsSubtitle: "Wähle alle Qualifikationen aus, die auf dich zutreffen. Diese Angaben sind freiwillig und helfen uns, im Notfall schnell die richtigen Personen zu finden.",
        selectedProfessions: (count: number) => `Du hast ${count} ${count === 1 ? 'Qualifikation' : 'Qualifikationen'} ausgewählt`,
    },

    performanceDetailsForm: {
        missionBriefing: "Teile uns Details zu deinem Auftritt mit, damit wir dich optimal einplanen können.",
        footerId: "WWWW-PERFORMANCE-DETAILS // ID-2025",
        title: "Auftrittsdetails",
        preferredDayLabel: "Bevorzugter Auftrittstag",
        preferredTimeLabel: "Bevorzugte Auftrittszeit",
        durationLabel: "Dauer des Auftritts (in Minuten)",
        genreLabel: "Genre / Stil",
        descriptionLabel: "Beschreibung deines Acts",
        bandMembersLabel: "Bandmitglieder*innen (falls zutreffend)"
    },

    ticketSelectionForm: {
        missionBriefing: "Wähle die Tage aus, an denen du als Künstler*in am Festival teilnehmen möchtest.",
        footerId: "WWWW-ARTIST-SCHEDULE // ID-2025",
        title: "Festival-Teilnahme"
    },

    beverageSelectionForm: {
        missionBriefing: "Auf dem Festivalgelände gibt es eine frei zugängliche Zapfanlage mit Bier. Als Künstler*in hast du kostenlos Zugang dazu. Wähle an wie vielen Tagen du das nutzen möchtest.",
        footerId: "WWWW-ARTIST-BEVERAGE // ID-2025",
        title: "Bierflatrate",
        noBeverage: "Ich trinke lieber etwas anderes."
    },

    foodSelectionForm: {
        missionBriefing: "Freitag und Samstag wird es von uns Abendessen geben. Als Künstler*in bekommst du eine Mahlzeit kostenlos.",
        footerId: "WWWW-ARTIST-FOOD // ID-2025",
        title: "Essensauswahl",
        noFood: "Ich esse lieber etwas anders."
    },

    materialsForm: {
        missionBriefing: "Falls du spezielle Ausrüstung mitbringen kannst, hilft uns das bei der Organisation des Festivals.",
        footerId: "WWWW-ARTIST-EQUIPMENT // ID-2025",
        title: "Benötigte Ausrüstung",
        materialsTitle: "Verfügbare Materialien",
        bringingItems: (count: number) => `Du bringst ${count} ${count === 1 ? 'Gegenstand' : 'Gegenstände'} mit`
    },

    technicalRequirementsForm: {
        missionBriefing: "Teile uns mit, welche technische Ausrüstung du für deinen Auftritt benötigst oder ob du andere spezielle Wünsche hast.",
        footerId: "WWWW-TECHNICAL-REQUIREMENTS // ID-2025",
        title: "Technische Anforderungen",
        equipmentLabel: "Benötigte Ausrüstung",
        equipmentPlaceholder: "Beschreibe hier deine technischen Anforderungen (Mikrofone, Verstärker, etc.)",
        stageSetupLabel: "Bühnenaufbau",
        stageSetupDescription: "Beschreibe, wie dein Bühnenaufbau aussehen soll."
    },

    specialRequestsForm: {
        missionBriefing: "Hast du besondere Wünsche oder Anforderungen für deinen Auftritt?",
        footerId: "WWWW-SPECIAL-REQUESTS // ID-2025",
        title: "Besondere Anfragen",
        specialRequestsLabel: "Besondere Wünsche",
        specialRequestsPlaceholder: "Hast du besondere Anforderungen oder Wünsche für deinen Auftritt?",
        additionalInfoLabel: "Zusätzliche Informationen",
        additionalInfoPlaceholder: "Gibt es sonst noch etwas, das wir wissen sollten?"
    },

    signatureForm: {
        missionBriefing: "Bitte bestätige mit deiner Unterschrift, dass du als Künstler beim Festival teilnehmen wirst.",
        footerId: "WWWW-ARTIST-CONFIRMATION // ID-2025",
        title: "Bestätigung",
        legalTitle: "Bestätigung der Künstlerbedingungen",
        legalText: "Hiermit bestätige ich, dass ich als Künstler am 'Weiher Wald und Weltall-Wahn 2025' teilnehmen werde. Ich verpflichte mich, zu den vereinbarten Zeiten aufzutreten und die Regeln des Festivals zu respektieren. Der Veranstalter haftet nicht für persönliche Gegenstände oder Ausrüstung.",
        signatureTitle: "Deine Unterschrift",
        validationError: "Bitte unterschreibe das Formular zur Bestätigung"
    },

    summaryForm: {
        missionBriefing: "Überprüfe deine Künstler-Daten und Auftrittsdetails vor der endgültigen Bestätigung.",
        footerId: "WWWW-ARTIST-SUMMARY // ID-2025",
        title: "Zusammenfassung",
        artistContribution: "Dein Beitrag",
        personalData: "Persönliche Daten",
        performanceDetails: "Auftrittsdetails",
        participationOption: "Festivalteilnahme",
        catering: "Verpflegung",
        beverageTitle: "Getränkeauswahl",
        foodTitle: "Essensauswahl",
        equipment: "Ausrüstung",
        technicalRequirements: "Technische Anforderungen",
        specialRequests: "Besondere Anfragen",
        bringingItems: "Ich bringe mit:",
        noMaterialsSelected: "Keine Materialien ausgewählt",
        professionsTitle: "Berufliche Qualifikationen",
        noProfessionsSelected: "Keine beruflichen Qualifikationen angegeben",
    },

    confirmationForm: {
        initialView: {
            missionBriefing: "Bereit für den kosmischen Auftritt! Bitte bestätige deine Teilnahme als Künstler*in.",
            footerId: "WWWW-ARTIST-LAUNCH-SEQUENCE // ID-2025",
            title: "Bereit für den großen Auftritt!",
            subtitle: "Wir freuen uns, dass du als Künstler*in beim Weiher Wald und Weltall-Wahn dabei sein möchtest! Mit dem Absenden der Buchung bestätigst du deine Teilnahme.",
            totalContribution: "Dein Gesamtbeitrag:",
            submitButton: "Anmeldung absenden",
            offlineWarning: "Du bist momentan offline. Bitte stelle eine Internetverbindung her, bevor du deine Anmeldung absendest.",
            errorMessage: "Es gab ein Problem beim Absenden der Anmeldung. Bitte versuche es erneut oder kontaktiere den Support.",
            paymentNote: "Falls ein Beitrag anfällt, kannst du diesen später bezahlen."
        },

        successView: {
            missionBriefing: "Deine Registrierung für das Weiher Wald & Weltall-Wahn war erfolgreich!",
            footerId: "WWWW-ARTIST-CONFIRMATION // ID-2025",
            title: "Deine Anmeldung war erfolgreich!",
            subtitle: "Du erhältst in Kürze eine Bestätigungsmail mit allen Details zu deiner Anmeldung. Wir werden uns vor dem Festival mit weiteren Informationen zu deinem Auftritt bei dir melden.",
            footer: "Wir freuen uns auf deinen Auftritt beim Weiher Wald und Weltall-Wahn!"
        },

        errorView: {
            missionBriefing: "Wir haben ein Problem mit deiner Registrierung. Bitte versuche es erneut oder kontaktiere uns.",
            footerId: "WWWW-ERROR-RECOVERY // ID-2025",
            title: "Anmeldung fehlgeschlagen",
            subtitle: "Leider konnte deine Anmeldung nicht abgeschlossen werden. Das kann verschiedene Gründe haben:",
            reasons: [
                "Netzwerkprobleme oder Serverüberlastung",
                "Probleme bei der Datenverarbeitung",
                "Technische Schwierigkeiten im System"
            ],
            contactInfo: "Bitte kontaktiere Christian Hauptmann per E-Mail oder Telefon, um deine Anmeldung manuell abzuschließen.",
            retryButton: "Erneut versuchen"
        },

        paymentInfo: {
            title: "Zahlungsinformationen (falls zutreffend)",
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
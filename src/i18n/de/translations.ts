export default {
    common: {
        title: "Mutiny Wallet",
        mutiny: "Mutiny",
        nice: "Schön",
        home: "Home",
        e_sats: "eSATS",
        e_sat: "eSAT",
        sats: "SATS",
        sat: "SAT",
        fee: "Gebühren",
        send: "Senden",
        receive: "Erhalten",
        dangit: "Mist",
        back: "Zurück",
        coming_soon: "(demnächst)",
        copy: "Kopieren",
        copied: "Kopiert",
        continue: "Weiter",
        error_unimplemented: "Nicht implementiert",
        why: "Warum?",
        private_tags: "Private Schlagwörter",
        view_transaction: "Transaction anzeigen",
        view_payment_details: "Zahlungsdetails anzeigen",
        pending: "Ausstehend",
        error_safe_mode:
            "Mutiny läuft im Safemode. Lightning ist deaktiviert.",
        self_hosted: "Selbst gehostet"
    },
    contacts: {
        new: "neu",
        add_contact: "Kontakt hinzufügen",
        new_contact: "Neuer Kontakt",
        create_contact: "Kontakt hinzufügen",
        edit_contact: "Kontakt bearbeiten",
        save_contact: "Kontakt speichern",
        delete: "Löschen",
        confirm_delete: "Bist du sicher, dass der Kontakt gelöscht werden soll?",
        payment_history: "Zahlungshistorie",
        no_payments: "Bisher keine Zahlungen mit",
        edit: "Ändern",
        pay: "Bezahlen",
        name: "Name",
        ln_address: "Lightning Adresse",
        placeholder: "Satoshi",
        lightning_address: "Lightning Adresse",
        unimplemented: "Nicht implementiert",
        not_available: "Noch nicht verfügbar",
        error_name: "Wir benötigen mindestens einen Namen",
        email_error: "Das sieht nicht nach einer Lightning Adresse aus",
        npub_error: "Das sieht nicht nach einem Nostr npub aus",
        error_ln_address_missing: "Neue Kontakte benötigen eine Lightning Adresse",
        npub: "Nostr Npub",
        link_to_nostr_sync: "Nostr Kontakte importieren"
    },
    redeem: {
        redeem_bitcoin: "Bitcoin einlösen",
        lnurl_amount_message:
            "Auszubezahlender Betrag zwischen {{min}} und {{max}} Sats eingeben",
        lnurl_redeem_failed: "Auszahlung abgebrochen",
        lnurl_redeem_success: "Zahlung erhalten"
    },
    receive: {
        receive_bitcoin: "Bitcoin erhalten",
        edit: "Bearbeiten",
        checking: "Überprüfung",
        choose_format: "Format wählen",
        payment_received: "Zahlung erhalten",
        payment_initiated: "Zahlung initiiert",
        receive_add_the_sender: "Absenderinformationen hinzufügen",
        keep_mutiny_open: "Bitte Mutiny geöffnet lassen, um die Zahlung abzuschliessen.",
        choose_payment_format: "Zahlungsformat auswählen",
        unified_label: "Kombiniert",
        unified_caption:
            "Kombiniert eine Bitcoin Adresse mit einer Lightning Rechnung. Der Sender wählt die Zahlungsmethode.",
        lightning_label: "Lightning Rechnung",
        lightning_caption:
            "Ideal für kleine Beträge. In der Regel mit geringeren Gebühren als eine On-chain Transaktion.",
        onchain_label: "Bitcoin Adresse",
        onchain_caption:
            "On-chain Transaktion, wie es Satoshi getan hat. Ideal für sehr grosse Beträge.",
        unified_setup_fee:
            "Bei einer Zahlung über Lightning wird eine Einrichtungsgebühr von {{amount}} SATS verrechnet.",
        lightning_setup_fee:
            "Beim Erhalten einer Zahlung wird eine Lightning Einrichtungsgebühr von {{amount}} SATS verrechnet.",
        amount: "Betrag",
        fee: "+ Gebühr",
        total: "Total",
        spendable: "Verfügbar",
        channel_size: "Kanalgrösse",
        channel_reserve: "- Kanalreserve",
        error_under_min_lightning:
            "Standardmässig über On-chain. Betrag ist zu klein für den Empfang deiner initiale Lightningzahlung.",
        error_creating_unified:
            "Standardmässig über On-chain. Etwas ist schief gelaufen bei der Erstellung einer einheitlichen Adresse",
        error_creating_address:
            "Etwas ist schief gelaufen bei der Erstellung einer On-chain Adresse",
        amount_editable: {
            receive_too_small:
                "Eine Lightning Einrichtungsgebühr wird möglicherweise vom angeforderten Betrag abgezogen.",
            setup_fee_lightning:
                "Beim Bezahlen über Lightning wird eine Einrichtungsgebühr fällig.",
            more_than_21m: "Es gibt nur 21 Millionen Bitcoin.",
            set_amount: "Bestimme den Betrag",
            max: "MAX",
            fix_amounts: {
                ten_k: "10k",
                one_hundred_k: "100k",
                one_million: "1m"
            },
            del: "LÖSCHEN",
            balance: "Kontostand"
        },
        integrated_qr: {
            onchain: "On-chain",
            lightning: "Lightning",
            unified: "Kombiniert",
            gift: "Lightning Geschenk"
        },
        remember_choice: "Auswahl merken",
        what_for: "Wozu?"
    },
    send: {
        search: {
            placeholder: "Name, Adresse, Rechnung",
            paste: "Einfügen",
            contacts: "Kontakte",
            global_search: "Globale Suche",
            no_results: "Keine Resultate für"
        },
        sending: "Senden...",
        confirm_send: "Sendung bestätigt",
        contact_placeholder: "Empfänger speichern",
        start_over: "Start über",
        send_bitcoin: "Bitcoin senden",
        paste: "Einfügen",
        scan_qr: "QR scannen",
        payment_initiated: "Zahlung initiiert",
        payment_sent: "Zahlung gesendet",
        destination: "Ziel",
        no_payment_info: "Keine Zahlungsinfo",
        progress_bar: {
            of: "von",
            sats_sent: "Sats gesendet"
        },
        what_for: "Wozu?",
        zap_note: "Zap Notiz",
        error_low_balance:
            "Der Kontostand ist zu niedrig, um den Betrag zu überweisen.",
        error_invoice_match:
            "Angeforderter Betrag, {{amount}} SATS, ist nicht identisch mit dem gesetzten Betrag.",
        error_channel_reserves: "Kontostand zu niedrig.",
        error_address: "Ungültige Lightning Adresse",
        error_channel_reserves_explained:
            "Ein Teil deines Kontostands ist reserviert für Gebühren. Versuche kleinere Beträge zu senden oder den Kontostand zu erhöhen.",
        error_clipboard: "Zwischenablage wird nicht unterstützt",
        error_keysend: "Sendung fehlgeschlagen",
        error_LNURL: "LNURL Bezahlung fehlgeschlagen",
        error_expired: "Rechnung ist abgelaufen",
        payjoin_send:
            "Das ist ein Payjoin! Die Meuterei wird so lange andauern, bis sich die Privatsphäre verbessert",
        payment_pending: "Zahlung ausstehend",
        payment_pending_description:
            "Es dauert eine Weile, aber es ist immer noch möglich, dass die Zahlung durchgeht. Bitte bei 'Aktivitäten' den aktuellen Status prüfen.",
        hodl_invoice_warning:
            "Das ist eine Hodl Rechnung. Zahlungen zu Hodl Rechnungen kann zu Schliessungen von Kanälen mit hohen On-chain Gebühren führen. Bezahlung auf eigenes Risiko!",
        private: "Privat",
        anonzap: "Anon Zap"
    },
    feedback: {
        header: "Lasse uns dein Feedback da!",
        received: "Feedback erhalten!",
        thanks: "Danke, dass du uns wissen lässt, was läuft.",
        more: "Hast du noch mehr zu sagen?",
        tracking:
            "Mutiny verfolgt oder spioniert dein Verhalten nicht aus, daher ist dein Feedback unglaublich hilfreich.",
        github: "Wir werden auf dein Feedback nicht antworten. Wenn du Unterstützung benötigst, bitte melden",
        create_issue: "Ein GitHub-Problem erstellen.",
        link: "Feedback?",
        feedback_placeholder: "Fehler, Funktionswünsche, Feedback, etc.",
        info_label: "Kontaktinformationen angeben",
        info_caption: "Wenn du möchtest, dass wir dieses Problem weiterverfolgen",
        email: "Email",
        email_caption: "Burners willkommen",
        nostr: "Nostr",
        nostr_caption: "Deine neuste npub",
        nostr_label: "Nostr npub oder NIP-05",
        send_feedback: "Feedback senden",
        invalid_feedback: "Bitte sage etwas!",
        need_contact: "Wir benötigen eine Möglichkeit, um dich zu kontaktieren",
        invalid_email: "Das sieht nicht nach einer Email-Adresse aus",
        error: "Fehler beim Senden des Feedbacks {{error}}",
        try_again: "Bitte versuche es später nochmals."
    },
    activity: {
        title: "Aktivität",
        mutiny: "Mutiny",
        wallet: "Wallet",
        nostr: "Nostr",
        view_all: "Alle anzeigen",
        receive_some_sats_to_get_started: "Sats erhalten, um zu starten",
        channel_open: "Kanal öffnen",
        channel_close: "Kanal schliessen",
        unknown: "Unbekannt",
        import_contacts:
            "Kontakte von Nostr importieren, um zu sehen wer dir etwas zappt.",
        coming_soon: "Demnächst",
        private: "Privat",
        anonymous: "Anonym",
        from: "Von:",
        transaction_details: {
            lightning_receive: "Erhalten via Lightning",
            lightning_send: "Gesendet via Lightning",
            channel_open: "Kanal öffnen",
            channel_close: "Kanal schliessen",
            onchain_receive: "On-chain erhalten",
            onchain_send: "On-chain gesendet",
            paid: "Bezahlt",
            unpaid: "Unbezahlt",
            status: "Status",
            date: "Datum",
            tagged_to: "Markiert mit",
            description: "Beschreibung",
            fee: "Gebühr",
            onchain_fee: "On-chain Gebühr",
            invoice: "Rechnung",
            payment_hash: "Zahlungs-Hash",
            payment_preimage: "Urbild",
            txid: "Txid",
            total: "Betrag angefordert",
            balance: "Kontostand",
            reserve: "Reserve",
            peer: "Peer",
            channel_id: "Kanal ID",
            reason: "Grund",
            confirmed: "Bestätigt",
            unconfirmed: "Unbestätigt",
            sweep_delay:
                "Es kann einige Tage dauern, bis deine Einlagen wieder in der Wallet verfügbar sind",
            no_details:
                "Keine Kanaldetails gefunden, was bedeutet, dass dieser Kanal wahrscheinlich geschlossen wurde.",
            back_home: "zurück zur Startseite"
        }
    },
    scanner: {
        paste: "Füge etwas ein",
        cancel: "Abbrechen"
    },
    settings: {
        header: "Einstellungen",
        support: "Lerne wie du Mutiny unterstützen kannst",
        experimental_features: "Experimente",
        debug_tools: "DEBUG TOOLS",
        danger_zone: "Gefahrenzone",
        general: "Allgemein",
        version: "Version:",
        admin: {
            title: "Admin Seite",
            caption: "Unsere internen Debug-Tools. Verwende sie mit Bedacht!",
            header: "Geheime Debug Tools",
            warning_one:
                "Wenn du weisst was du tust, bist du am richtigen Ort.",
            warning_two:
                "Das sind interne Tools, die wir fürs Debuggen und Testen der App verwenden. Bitte vorsichtig sein!",
            kitchen_sink: {
                disconnect: "Trennen",
                peers: "Peers",
                no_peers: "Keine Peers",
                refresh_peers: "Peers aktualisieren",
                connect_peer: "Peer verbinden",
                expect_a_value: "Ein Wert wird erwartet...",
                connect: "Verbinden",
                close_channel: "Kanal schliessen",
                force_close: "Kanal schliessen erzwingen",
                abandon_channel: "Kanal verlassen",
                confirm_close_channel:
                    "Bist du sicher, dass du den Kanal schliessen willst?",
                confirm_force_close:
                    "Bist du sicher, dass du die Kanalschliessung erzwingen willst? Deine Einlagen benötigen ein paar Tage, bis sie On-chain verfügbar sind.",
                confirm_abandon_channel:
                    "Bist du sicher, dass du diesen Kanal verlassen willst? Typischerweise wird diese Aktion nur ausgeführt, wenn die eröffnende Transaktion nicht bestätigt werden kann. Andernfalls wirst du deine Einlagen verlieren.",
                channels: "Kanäle",
                no_channels: "Keine Kanäle",
                refresh_channels: "Kanäle aktualisieren",
                pubkey: "Pubkey",
                amount: "Betrag",
                open_channel: "Kanal eröffnen",
                nodes: "Nodes",
                no_nodes: "Keine Nodes",
                enable_zaps_to_hodl: "Zaps nach hodl invoices erlauben?",
                zaps_to_hodl_desc:
                    "Zaps nach hodl invoices kann zu erzwungenen Kanalschliessungen und hohen On-chain Gebühren führen. Benutzung auf eigene Gefahr!",
                zaps_to_hodl_enable: "Hodl Zaps aktivieren",
                zaps_to_hodl_disable: "Hodl Zaps deaktivieren"
            }
        },
        backup: {
            title: "Backup",
            secure_funds: "Sorgen wir dafür, dass deine Einlagen gesichert werden.",
            twelve_words_tip:
                "Wir werden dir 12 Wörter zeigen. Du schreibst die 12 Wörter auf.",
            warning_one:
                "Wenn du deine Browser-Historie löschst oder dein Gerät verlierst sind diese 12 Wörter der einzige Weg, um dein Wallet wiederherzustellen.",
            warning_two: "Mutiny ist eine selbst verwahrende Wallet. Du allein bist dafür verantwortlich...",
            confirm: "Ich habe die Wörter aufgeschrieben",
            responsibility: "Ich bin mir bewusst, dass meine Einlagen in meiner Verantwortung sind",
            liar: "Ich lüge nicht, nur um das hinter mich zu bringen",
            seed_words: {
                reveal: "TIPPE, UM DIE SEED-WÖRTER ZU ENTDECKEN",
                hide: "VERSTECKEN",
                copy: "Gefährliches Kopieren in die Zwischenablage",
                copied: "Kopiert!"
            }
        },
        channels: {
            title: "Lightning Kanäle",
            outbound: "Outbound",
            inbound: "Inbound",
            reserve: "Reserve",
            have_channels: "Du hast",
            have_channels_one: "Lightning Kanal.",
            have_channels_many: "lightning Kanäle.",
            inbound_outbound_tip:
                "Outbound ist der Betrag, den du über Lightning ausgeben kannst. Inbound ist der Betrag, den du über Lightning empfangen kannst ohne eine Lightning Servicegebühr zu bezahlen.",
            reserve_tip:
                "Um die 1% deines Kontostandes ist reserviert, um Lightning Gebühren zu bezahlen. Zusätzliche Reserven sind nötig, um Kanäle via Swap zu öffnen.",
            no_channels:
                "Anscheinend hast du noch keine Kanäle. Erhalte ein paar Sats über Lightning, um zu starten. Oder transferiere ein paar on-chain Bitcoin in einen Lightning Kanal. Mache ruhig deine Hände schmutzig!",
            close_channel: "Schliessen",
            online_channels: "Online Kanäle",
            offline_channels: "Offline Kanäle",
            close_channel_confirm:
                "Wenn der Kanal geschlossen wird, werden die Einlagen nach on-chain transferiert. Dies führt zu einer on-chain Gebühr."
        },
        connections: {
            title: "Wallet Verbindungen",
            error_name: "Name kann nicht leer sein",
            error_connection: "Wallet Verbindung konnte nicht erstellt werden",
            error_budget_zero: "Der Budgetrahmen muss grösser sein als 0",
            add_connection: "Verbindung hinzufügen",
            manage_connections: "Verbindungen verwalten",
            manage_gifts: "Geschenke verwalten",
            delete_connection: "Löschen",
            new_connection: "Neue Verbindung",
            edit_connection: "Verbindung bearbeiten",
            new_connection_label: "Name",
            new_connection_placeholder: "Mein Lieblings-Nostr-Client...",
            create_connection: "Verbindung erstellen",
            save_connection: "Änderungen speichern",
            edit_budget: "Budgetrahmen bearbeiten",
            open_app: "App öffnen",
            open_in_nostr_client: "In Nostr-Client öffnen",
            open_in_primal: "In Primal öffnen",
            nostr_client_not_found: "Nostr-Client konnte nicht gefunden werden",
            client_not_found_description:
                "Installiere einen Nostr-Client wie Primal, Amethyst oder Damus, um den Link zu öffnen.",
            relay: "Relais",
            authorize:
                "Autorisiere externe Dienste, um Zahlungen von deinem Wallet anzufordern. Passt hervorragend zu Nostr-Clients.",
            pending_nwc: {
                title: "Offene Anfragen",
                approve_all: "Alle genehmigen",
                deny_all: "Alle ablehnen"
            },
            careful:
                "Vorsicht beim Teilen dieser Verbindung! Anfragen innerhalb des Budgetrahmens werden automatisch bezahlt.",
            spent: "Ausgegeben",
            remaining: "Übrig",
            confirm_delete: "Bist du sicher, dass du diese Verbindung löschen willst?",
            budget: "Budgetrahmen",
            resets_every: "Alles zurücksetzen",
            resubscribe_date: "Erneut abonnieren"
        },
        emergency_kit: {
            title: "Notfallbausatz",
            caption: "Probleme im Wallet diagnostizieren und lösen.",
            emergency_tip:
                "Wenn deine Wallet nicht mehr läuft, findest du hier ein paar Werkzeuge, um es zu debuggen und reparieren.",
            questions:
                "Bitte melde dich, wenn du Fragen dazu hast, was diese Buttons tun",
            link: "melde dich bei uns für Unterstützung.",
            import_export: {
                title: "Wallet-Status exportieren",
                error_password: "Passwort wird benötigt",
                error_read_file: "Fehler beim Lesen der Datei",
                error_no_text: "Keinen Text in der Datei gefunden",
                tip: "Du kannst deinen gesamten Status aus der Mutiniy-Wallet als Datei exportieren and sie in einem neuen Browser importieren. Normalerweise funktioniert es!",
                caveat_header: "Wichtige Vorbehalte:",
                caveat: " Nach dem Exportieren bitte keine Operationen mehr im originalen Browser vornehmen. Wenn doch, musst du den Export nochmals durchführen. Nach einem erfolgreichen Import wird empfohlen den Status im originalen Browser zu löschen. So wird sichergestellt, dass es keine Konflikte gibt.",
                save_state: "Status als Datei speichern",
                import_state: "Status aus einer Datei importieren",
                confirm_replace: "Möchtest du deinen Status ersetzen mit",
                password: "Passwort eingeben, um zu entschlüsseln",
                decrypt_wallet: "Wallet entschlüsseln"
            },
            logs: {
                title: "Debug-Protokolle herunterladen",
                something_screwy:
                    "Irgendetwas Verrücktes ist im Gange? Bitte schaue das Protokoll an!",
                download_logs: "Protokolle herunterladen",
                password: "Passwort eingeben, um zu entschlüsseln",
                confirm_password_label: "Passwort bestätigen"
            },
            delete_everything: {
                delete: "Alles löschen",
                confirm:
                    "Damit löschst du den Status deiner Node. Das kann nicht rückgängig gemacht werden!",
                deleted: "Gelöscht",
                deleted_description: "Alle Daten gelöscht"
            }
        },
        encrypt: {
            title: "Passwort ändern",
            caption: "Bitte zuerst ein Backup erstellen, um die Verschlüsselung zu entsperren",
            header: "Deine Seed-Wörter entschlüsseln",
            hot_wallet_warning:
                'Mutiny ist eine "Hot Wallet". Um zu funktionieren, benötigt es deine Seed-Wörter. Du kannst aber optional deine Seed-Wörter mit einem Passwort verschlüsseln.',
            password_tip:
                "Auf diese Weise hat jemand, der Zugriff auf deinen Browser erhält, immer noch keinen Zugriff auf dein Geld.",
            optional: "(optional)",
            existing_password: "Bestehendes Passwort",
            existing_password_caption:
                "Leer lassen, wenn du noch kein Passwort gesetzt hast.",
            new_password_label: "Passwort",
            new_password_placeholder: "Ein Passwort eingeben",
            new_password_caption:
                "Dieses Passwort wird genutzt, um deine Seed-Wörter zu verschlüsseln. Wenn du es vergisst, musst du deine Seed-Wörter wieder eingeben, um an deine Einlagen zu gelangen. Du hast deine Seed-Wörter aufgeschrieben, oder?",
            confirm_password_label: "Passwort bestätigen",
            confirm_password_placeholder: "Passwort wiederholen",
            encrypt: "Verschlüsseln",
            skip: "Überspringen",
            error_match: "Passwort stimmt nicht überein",
            error_same_as_existingpassword:
                "Das neue Passwort darf nicht mit dem bestehenden Passwort übereinstimmen"
        },
        decrypt: {
            title: "Passwort eingeben",
            decrypt_wallet: "Wallet entschlüsseln",
            forgot_password_link: "Passwort vergessen?",
            error_wrong_password: "Passwort ungültig"
        },
        currency: {
            title: "Währung",
            caption: "Wähle dein bevorzugtes Währungspaar",
            select_currency: "Währung auswählen",
            select_currency_label: "Währungspaar",
            select_currency_caption:
                "Wenn du eine neue Währung auswählst, wird das Wallet neu synchronisiert und die Preise aktualisiert",
            request_currency_support_link:
                "Unterstützung anfordern für weitere Währungen",
            error_unsupported_currency: "Bitte eine unterstützte Währung auswählen."
        },
        language: {
            title: "Sprache",
            caption: "Wähle deine bevorzugte Sprache",
            select_language: "Sprache auswählen",
            select_language_label: "Sprache",
            select_language_caption:
                "Wenn du eine neue Sprache auswählst, wird die Sprache in der Wallet geändert, unabhängig davon welche Sprache dein Browser verwendet",
            request_language_support_link: "Fordere Unterstützung für weitere Sprachen an",
            error_unsupported_language: "Bitte eine unterstützte Sprache auswählen."
        },
        lnurl_auth: {
            title: "LNURL Auth",
            auth: "Auth",
            expected: "Erwarte etwas wie LNURL..."
        },
        plus: {
            title: "Mutiny+",
            join: "Mitmachen",
            sats_per_month: "für {{amount}} Sats im Monat.",
            lightning_balance:
                "Du benötigst mindestens {{amount}} Sats in deiner Lightning Wallet, um zu starten. Probiere es aus bevor du kaufst!",
            restore: "Abonnement wiederherstellen",
            ready_to_join: "Bereit zum Mitmachen",
            click_confirm: "Klicke auf bestätigen, um deinen ersten Monat zu bezahlen.",
            open_source: "Mutiny ist Open Source und selbstverwahrend.",
            optional_pay: "Aber du kannst auch dafür bezahlen.",
            paying_for: "Dafür bezahlen",
            supports_dev:
                "unterstützt die laufende Entwicklung und ermöglicht den frühzeitigen Zugriff auf neue Features und Premium-Funktionalitäten:",
            thanks: "Du bist Teil von Mutiny! Genieße die folgenden Vorteile:",
            renewal_time: "Du erhältst eine Zahlungsaufforderung für die Verlängerung",
            cancel: "Um dein Abonnement zu beenden, bezahle einfach nicht mehr. Du kannst Mutiny+ auch deaktivieren",
            wallet_connection: "Wallet Verbindung.",
            subscribe: "Einschreiben",
            error_no_plan: "Kein Abonnement gefunden",
            error_failure: "Konnte nicht abonniert werden",
            error_no_subscription: "Kein bestehendes Abonnement gefunden",
            error_expired_subscription:
                "Dein Abonnement ist abgelaufen, klicke auf Mitmachen, um es zu erneuern",
            satisfaction: "Selbstgefällige Zufriedenheit",
            gifting: "Schenken",
            multi_device: "Zugriff mit mehreren Geräten",
            ios_testflight: "Zugang zu iOS TestFlight",
            more: "... und es wird noch mehr kommen",
            cta_description:
                "Genieße frühzeitigen Zugriff auf neue Features und Premium-Funktionalitäten.",
            cta_but_already_plus: "Danke für deinen Support!"
        },
        restore: {
            title: "Restore",
            all_twelve: "You need to enter all 12 words",
            wrong_word: "Wrong word",
            paste: "Dangerously Paste from Clipboard",
            confirm_text:
                "Are you sure you want to restore to this wallet? Your existing wallet will be deleted!",
            restore_tip:
                "You can restore an existing Mutiny Wallet from your 12 word seed phrase. This will replace your existing wallet, so make sure you know what you're doing!",
            multi_browser_warning:
                "Do not use on multiple browsers at the same time.",
            error_clipboard: "Clipboard not supported",
            error_word_number: "Wrong number of words",
            error_invalid_seed: "Invalid seed phrase"
        },
        servers: {
            title: "Servers",
            caption: "Don't trust us! Use your own servers to back Mutiny.",
            link: "Learn more about self-hosting",
            proxy_label: "Websockets Proxy",
            proxy_caption:
                "How your lightning node communicates with the rest of the network.",
            error_proxy: "Should be a url starting with wss://",
            esplora_label: "Esplora",
            esplora_caption: "Block data for on-chain information.",
            error_esplora: "That doesn't look like a URL",
            rgs_label: "RGS",
            rgs_caption:
                "Rapid Gossip Sync. Network data about the lightning network used for routing.",
            error_rgs: "That doesn't look like a URL",
            lsp_label: "LSP",
            lsp_caption:
                "Lightning Service Provider. Automatically opens channels to you for inbound liquidity. Also wraps invoices for privacy.",
            lsps_connection_string_label: "LSPS Connection String",
            lsps_connection_string_caption:
                "Lightning Service Provider. Automatically opens channels to you for inbound liquidity. Using LSP specification.",
            error_lsps_connection_string:
                "That doesn't look like node connection string",
            lsps_token_label: "LSPS Token",
            lsps_token_caption:
                "LSPS Token.  Used to identify what wallet is connecting to the LSP",
            lsps_valid_error:
                "You can either have just an LSP set or LSPS Connection String and LSPS Token set, not both.",
            error_lsps_token: "That doesn't look like a valid token",
            storage_label: "Storage",
            storage_caption: "Encrypted VSS backup service.",
            error_lsp: "That doesn't look like a URL",
            save: "Save"
        },
        nostr_contacts: {
            title: "Sync Nostr Contacts",
            npub_label: "Nostr npub",
            npub_required: "Npub can't be blank",
            sync: "Sync",
            resync: "Resync",
            remove: "Remove"
        },
        manage_federations: {
            title: "Manage Federations",
            federation_code_label: "Federation code",
            federation_code_required: "Federation code can't be blank",
            federation_added_success: "Federation added successfully",
            federation_remove_confirm:
                "Are you sure you want to remove this federation? Make sure any funds you have are transferred to your lightning balance or another wallet first.",
            add: "Add",
            remove: "Remove",
            expires: "Expires",
            federation_id: "Federation ID",
            description:
                "Mutiny has experimental support for the Fedimint protocol. You'll need a federation invite code to use this feature. These funds are currently not backed up remotely. Store funds in a federation at your own risk!",
            learn_more: "Learn more about Fedimint."
        },
        gift: {
            give_sats_link: "Give sats as a gift",
            title: "Gifting",
            no_plus_caption: "Upgrade to Mutiny+ to enable gifting",
            receive_too_small:
                "Your first receive needs to be {{amount}} SATS or greater.",
            setup_fee_lightning:
                "A lightning setup fee will be charged to receive this gift.",
            already_claimed: "This gift has already been claimed",
            sender_is_poor:
                "The sender doesn't have enough balance to pay this gift.",
            sender_timed_out:
                "Gift payment timed out. The sender may be offline, or this gift has already been claimed.",
            sender_generic_error: "Sender sent error: {{error}}",
            receive_header: "You've been gifted some sats!",
            receive_description:
                "You must be pretty special. To claim your money just hit the big button. Funds will be added to this wallet the next time your gifter is online.",
            receive_claimed:
                "Gift claimed! You should see the gift hit your balance shortly.",
            receive_cta: "Claim Gift",
            receive_try_again: "Try Again",
            send_header: "Create Gift",
            send_explainer:
                "Give the gift of sats. Create a Mutiny gift URL that can be claimed by anyone with a web browser.",
            send_name_required: "This is for your records",
            send_name_label: "Recipient Name",
            send_header_claimed: "Gift Received!",
            send_claimed: "Your gift has been claimed. Thanks for sharing.",
            send_sharable_header: "Sharable URL",
            send_instructions:
                "Copy this gift URL to your recipient, or ask them to scan this QR code with their wallet.",
            send_another: "Create Another",
            send_small_warning:
                "A brand new Mutiny user won't be able to redeem fewer than 100k sats.",
            send_cta: "Create a gift",
            send_delete_button: "Delete Gift",
            send_delete_confirm:
                "Are you sure you want to delete this gift? Is this your rugpull moment?",
            send_tip:
                "Your copy of Mutiny Wallet needs to be open for the gift to be redeemed.",
            need_plus:
                "Upgrade to Mutiny+ to enable gifting. Gifting allows you to create a Mutiny gift URL that can be claimed by anyone with a web browser."
        }
    },
    swap: {
        peer_not_found: "Peer not found",
        channel_too_small:
            "It's just silly to make a channel smaller than {{amount}} sats",
        insufficient_funds: "You don't have enough funds to make this channel",
        header: "Swap to Lightning",
        initiated: "Swap Initiated",
        sats_added: "+{{amount}} sats will be added to your Lightning balance",
        use_existing: "Use existing peer",
        choose_peer: "Choose a peer",
        peer_connect_label: "Connect to new peer",
        peer_connect_placeholder: "Peer connect string",
        connect: "Connect",
        connecting: "Connecting...",
        confirm_swap: "Confirm Swap"
    },
    swap_lightning: {
        insufficient_funds: "You don't have enough funds to swap to lightning",
        header: "Swap to Lightning",
        header_preview: "Preview Swap",
        completed: "Swap Completed",
        too_small:
            "Invalid amount entered. You need to swap at least 100k sats.",
        sats_added:
            "+{{amount}} sats have been added to your Lightning balance",
        sats_fee: "+{{amount}} sats fee",
        confirm_swap: "Confirm Swap",
        preview_swap: "Preview Swap Fee"
    },
    reload: {
        mutiny_update: "Mutiny Update",
        new_version_description:
            "New version of Mutiny has been cached, reload to start using it.",
        reload: "Reload"
    },
    error: {
        title: "Error",
        emergency_link: "emergency kit.",
        reload: "Reload",
        restart: {
            title: "Something *extra* screwy going on? Stop the nodes!",
            start: "Start",
            stop: "Stop"
        },
        general: {
            oh_no: "Oh no!",
            never_should_happen: "This never should've happened",
            try_reloading:
                'Try reloading this page or clicking the "Dangit" button. If you keep having problems,',
            support_link: "reach out to us for support.",
            getting_desperate: "Getting desperate? Try the"
        },
        load_time: {
            stuck: "Stuck on this screen? Try reloading. If that doesn't work, check out the"
        },
        not_found: {
            title: "Not Found",
            wtf_paul: "This is probably Paul's fault."
        },
        reset_router: {
            payments_failing:
                "Failing to make payments? Try resetting the lightning router.",
            reset_router: "Reset Router"
        },
        resync: {
            incorrect_balance:
                "On-chain balance seems incorrect? Try re-syncing the on-chain wallet.",
            resync_wallet: "Resync wallet"
        },
        on_boot: {
            existing_tab: {
                title: "Multiple tabs detected",
                description:
                    "Mutiny can only be used in one tab at a time. It looks like you have another tab open with Mutiny running. Please close that tab and refresh this page, or close this tab and refresh the other one."
            },
            already_running: {
                title: "Mutiny may be running on another device",
                description:
                    "Mutiny can only be used in one place at a time. It looks like you have another device or browser using this wallet. If you've recently closed Mutiny on another device, please wait a few minutes and try again.",
                retry_again_in: "Retry again in",
                seconds: "seconds"
            },
            incompatible_browser: {
                title: "Incompatible browser",
                header: "Incompatible browser detected",
                description:
                    "Mutiny requires a modern browser that supports WebAssembly, LocalStorage, and IndexedDB. Some browsers disable these features in private mode.",
                try_different_browser:
                    'Please make sure your browser supports all these features, or consider trying another browser. You might also try disabling certain extensions or "shields" that block these features.',
                browser_storage:
                    "(We'd love to support more private browsers, but we have to save your wallet data to browser storage or else you will lose funds.)",
                browsers_link: "Supported Browsers"
            },
            loading_failed: {
                title: "Failed to load",
                header: "Failed to load Mutiny",
                description:
                    "Something went wrong while booting up Mutiny Wallet.",
                repair_options:
                    "If your wallet seems broken, here are some tools to try to debug and repair it.",
                questions:
                    "If you have any questions on what these buttons do, please",
                support_link: "reach out to us for support.",
                services_down:
                    "It looks like one of Mutiny's services is down. Please try again later.",
                in_the_meantime:
                    "In the meantime if you want to access your on-chain funds you can load Mutiny in",
                safe_mode: "Safe Mode"
            }
        }
    },
    modals: {
        share: "Share",
        details: "Details",
        loading: {
            loading: "Loading: {{stage}}",
            default: "Just getting started",
            double_checking: "Double checking something",
            downloading: "Downloading",
            setup: "Setup",
            done: "Done"
        },
        onboarding: {
            welcome: "Welcome!",
            restore_from_backup:
                "If you've used Mutiny before you can restore from a backup. Otherwise you can skip this and enjoy your new wallet!",
            not_available: "We don't do that yet",
            secure_your_funds: "Secure your funds"
        },
        more_info: {
            whats_with_the_fees: "What's with the fees?",
            self_custodial:
                "Mutiny is a self-custodial wallet. To initiate a lightning payment we must open a lightning channel, which requires a minimum amount and a setup fee.",
            future_payments:
                "Future payments, both send and receive, will only incur normal network fees and a nominal service fee unless your channel runs out of inbound capacity.",
            liquidity: "Learn more about liquidity"
        },
        confirm_dialog: {
            are_you_sure: "Are you sure?",
            cancel: "Cancel",
            confirm: "Confirm"
        },
        lnurl_auth: {
            auth_request: "Authentication Request",
            login: "Login",
            decline: "Decline",
            error: "That didn't work for some reason.",
            authenticated: "Authenticated!"
        }
    }
};

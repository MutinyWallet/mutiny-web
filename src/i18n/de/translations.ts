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
        unified_label: "Vereinheitlicht",
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
            unified: "Vereinheitlicht",
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
                "Es kann einige Tage dauern, bis die Funds wieder in die Wallet gelangen",
            no_details:
                "Keine Kanaldetails gefunden, was bedeutet, dass dieser Kanal wahrscheinlich geschlossen wurde.",
            back_home: "zurück zur Startseite"
        }
    },
    scanner: {
        paste: "Paste Something",
        cancel: "Cancel"
    },
    settings: {
        header: "Settings",
        support: "Learn how to support Mutiny",
        experimental_features: "Experiments",
        debug_tools: "DEBUG TOOLS",
        danger_zone: "Danger zone",
        general: "General",
        version: "Version:",
        admin: {
            title: "Admin Page",
            caption: "Our internal debug tools. Use wisely!",
            header: "Secret Debug Tools",
            warning_one:
                "If you know what you're doing you're in the right place.",
            warning_two:
                "These are internal tools we use to debug and test the app. Please be careful!",
            kitchen_sink: {
                disconnect: "Disconnect",
                peers: "Peers",
                no_peers: "No peers",
                refresh_peers: "Refresh Peers",
                connect_peer: "Connect Peer",
                expect_a_value: "Expecting a value...",
                connect: "Connect",
                close_channel: "Close Channel",
                force_close: "Force close Channel",
                abandon_channel: "Abandon Channel",
                confirm_close_channel:
                    "Are you sure you want to close this channel?",
                confirm_force_close:
                    "Are you sure you want to force close this channel? Your funds will take a few days to redeem on chain.",
                confirm_abandon_channel:
                    "Are you sure you want to abandon this channel? Typically only do this if the opening transaction will never confirm. Otherwise, you will lose funds.",
                channels: "Channels",
                no_channels: "No Channels",
                refresh_channels: "Refresh Channels",
                pubkey: "Pubkey",
                amount: "Amount",
                open_channel: "Open Channel",
                nodes: "Nodes",
                no_nodes: "No nodes",
                enable_zaps_to_hodl: "Enable zaps to hodl invoices?",
                zaps_to_hodl_desc:
                    "Zaps to hodl invoices can result in channel force closes, which results in high on-chain fees. Use at your own risk!",
                zaps_to_hodl_enable: "Enable hodl zaps",
                zaps_to_hodl_disable: "Disable hodl zaps"
            }
        },
        backup: {
            title: "Backup",
            secure_funds: "Let's get these funds secured.",
            twelve_words_tip:
                "We'll show you 12 words. You write down the 12 words.",
            warning_one:
                "If you clear your browser history, or lose your device, these 12 words are the only way you can restore your wallet.",
            warning_two: "Mutiny is self-custodial. It's all up to you...",
            confirm: "I wrote down the words",
            responsibility: "I understand that my funds are my responsibility",
            liar: "I'm not lying just to get this over with",
            seed_words: {
                reveal: "TAP TO REVEAL SEED WORDS",
                hide: "HIDE",
                copy: "Dangerously Copy to Clipboard",
                copied: "Copied!"
            }
        },
        channels: {
            title: "Lightning Channels",
            outbound: "Outbound",
            inbound: "Inbound",
            reserve: "Reserve",
            have_channels: "You have",
            have_channels_one: "lightning channel.",
            have_channels_many: "lightning channels.",
            inbound_outbound_tip:
                "Outbound is the amount of money you can spend on lightning. Inbound is the amount you can receive without incurring a lightning service fee.",
            reserve_tip:
                "About 1% of your channel balance is reserved on lightning for fees. Additional reserves are required for channels you opened via swap.",
            no_channels:
                "It looks like you don't have any channels yet. To get started, receive some sats over lightning, or swap some on-chain funds into a channel. Get your hands dirty!",
            close_channel: "Close",
            online_channels: "Online Channels",
            offline_channels: "Offline Channels",
            close_channel_confirm:
                "Closing this channel will move the balance on-chain and incur an on-chain fee."
        },
        connections: {
            title: "Wallet Connections",
            error_name: "Name cannot be empty",
            error_connection: "Failed to create Wallet Connection",
            error_budget_zero: "Budget must be greater than zero",
            add_connection: "Add Connection",
            manage_connections: "Manage Connections",
            manage_gifts: "Manage Gifts",
            delete_connection: "Delete",
            new_connection: "New Connection",
            edit_connection: "Edit Connection",
            new_connection_label: "Name",
            new_connection_placeholder: "My favorite nostr client...",
            create_connection: "Create Connection",
            save_connection: "Save Changes",
            edit_budget: "Edit Budget",
            open_app: "Open App",
            open_in_nostr_client: "Open in Nostr Client",
            open_in_primal: "Open in Primal",
            nostr_client_not_found: "Nostr client not found",
            client_not_found_description:
                "Install a nostr client like Primal, Amethyst, or Damus to open this link.",
            relay: "Relay",
            authorize:
                "Authorize external services to request payments from your wallet. Pairs great with Nostr clients.",
            pending_nwc: {
                title: "Pending Requests",
                approve_all: "Approve All",
                deny_all: "Deny All"
            },
            careful:
                "Be careful where you share this connection! Requests within budget will paid automatically.",
            spent: "Spent",
            remaining: "Remaining",
            confirm_delete: "Are you sure you want to delete this connection?",
            budget: "Budget",
            resets_every: "Resets every",
            resubscribe_date: "Resubscribe on"
        },
        emergency_kit: {
            title: "Emergency Kit",
            caption: "Diagnose and solve problems with your wallet.",
            emergency_tip:
                "If your wallet seems broken, here are some tools to try to debug and repair it.",
            questions:
                "If you have any questions on what these buttons do, please",
            link: "reach out to us for support.",
            import_export: {
                title: "Export wallet state",
                error_password: "Password is required",
                error_read_file: "File read error",
                error_no_text: "No text found in file",
                tip: "You can export your entire Mutiny Wallet state to a file and import it into a new browser. It usually works!",
                caveat_header: "Important caveats:",
                caveat: "after exporting don't do any operations in the original browser. If you do, you'll need to export again. After a successful import, a best practice is to clear the state of the original browser just to make sure you don't create conflicts.",
                save_state: "Save State As File",
                import_state: "Import State From File",
                confirm_replace: "Do you want to replace your state with",
                password: "Enter your password to decrypt",
                decrypt_wallet: "Decrypt Wallet"
            },
            logs: {
                title: "Download debug logs",
                something_screwy:
                    "Something screwy going on? Check out the logs!",
                download_logs: "Download Logs",
                password: "Enter your password to decrypt",
                confirm_password_label: "Confirm Password"
            },
            delete_everything: {
                delete: "Delete Everything",
                confirm:
                    "This will delete your node's state. This can't be undone!",
                deleted: "Deleted",
                deleted_description: "Deleted all data"
            }
        },
        encrypt: {
            title: "Change Password",
            caption: "Backup first to unlock encryption",
            header: "Encrypt your seed words",
            hot_wallet_warning:
                'Mutiny is a "hot wallet" so it needs your seed word to operate, but you can optionally encrypt those words with a password.',
            password_tip:
                "That way, if someone gets access to your browser, they still won't have access to your funds.",
            optional: "(optional)",
            existing_password: "Existing password",
            existing_password_caption:
                "Leave blank if you haven't set a password yet.",
            new_password_label: "Password",
            new_password_placeholder: "Enter a password",
            new_password_caption:
                "This password will be used to encrypt your seed words. If you forget it, you will need to re-enter your seed words to access your funds. You did write down your seed words, right?",
            confirm_password_label: "Confirm Password",
            confirm_password_placeholder: "Enter the same password",
            encrypt: "Encrypt",
            skip: "Skip",
            error_match: "Passwords do not match",
            error_same_as_existingpassword:
                "New password must not match existing password"
        },
        decrypt: {
            title: "Enter your password",
            decrypt_wallet: "Decrypt Wallet",
            forgot_password_link: "Forgot Password?",
            error_wrong_password: "Invalid Password"
        },
        currency: {
            title: "Currency",
            caption: "Choose your preferred currency pair",
            select_currency: "Select Currency",
            select_currency_label: "Currency Pair",
            select_currency_caption:
                "Choosing a new currency will resync the wallet to fetch a price update",
            request_currency_support_link:
                "Request support for more currencies",
            error_unsupported_currency: "Please Select a supported currency."
        },
        language: {
            title: "Language",
            caption: "Choose your preferred language",
            select_language: "Select Language",
            select_language_label: "Language",
            select_language_caption:
                "Choosing a new currency will change the wallet language, ignoring current browser language",
            request_language_support_link: "Request support for more languages",
            error_unsupported_language: "Please Select a supported language."
        },
        lnurl_auth: {
            title: "LNURL Auth",
            auth: "Auth",
            expected: "Expecting something like LNURL..."
        },
        plus: {
            title: "Mutiny+",
            join: "Join",
            sats_per_month: "for {{amount}} sats a month.",
            lightning_balance:
                "You'll need at least {{amount}} sats in your lightning balance to get started. Try before you buy!",
            restore: "Restore Subscription",
            ready_to_join: "Ready to join",
            click_confirm: "Click confirm to pay for your first month.",
            open_source: "Mutiny is open source and self-hostable.",
            optional_pay: "But also you can pay for it.",
            paying_for: "Paying for",
            supports_dev:
                "helps support ongoing development and unlocks early access to new features and premium functionality:",
            thanks: "You're part of the mutiny! Enjoy the following perks:",
            renewal_time: "You'll get a renewal payment request around",
            cancel: "To cancel your subscription just don't pay. You can also disable the Mutiny+",
            wallet_connection: "Wallet Connection.",
            subscribe: "Subscribe",
            error_no_plan: "No plans found",
            error_failure: "Couldn't subscribe",
            error_no_subscription: "No existing subscription found",
            error_expired_subscription:
                "Your subscription has expired, click join to renew",
            satisfaction: "Smug satisfaction",
            gifting: "Gifting",
            multi_device: "Multi-device access",
            ios_testflight: "iOS TestFlight access",
            more: "... and more to come",
            cta_description:
                "Enjoy early access to new features and premium functionality.",
            cta_but_already_plus: "Thank you for your support!"
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

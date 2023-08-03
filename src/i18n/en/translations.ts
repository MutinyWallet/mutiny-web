export default {
    common: {
        title: "Mutiny Wallet",
        nice: "Nice",
        home: "Home",
        sats: "SATS",
        sat: "SAT",
        usd: "USD",
        fee: "Fee",
        send: "Send",
        receive: "Receive",
        dangit: "Dangit",
        back: "Back",
        coming_soon: "(coming soon)",
        copy: "Copy",
        copied: "Copied",
        continue: "Continue",
        error_unimplemented: "Unimplemented",
        why: "Why?",
        private_tags: "Private tags",
        view_transaction: "View Transaction",
        pending: "Pending"
    },
    contacts: {
        new: "new",
        add_contact: "Add Contact",
        new_contact: "New Contact",
        create_contact: "Create contact",
        edit_contact: "Edit contact",
        save_contact: "Save contact",
        payment_history: "Payment history",
        no_payments: "No payments yet with",
        edit: "Edit",
        pay: "Pay",
        name: "Name",
        placeholder: "Satoshi",
        unimplemented: "Unimplemented",
        not_available: "We don't do that yet",
        error_name: "We at least need a name"
    },
    receive: {
        receive_bitcoin: "Receive Bitcoin",
        edit: "Edit",
        checking: "Checking",
        choose_format: "Choose format",
        payment_received: "Payment Received",
        payment_initiated: "Payment Initiated",
        receive_add_the_sender: "Add the sender for your records",
        keep_mutiny_open: "Keep Mutiny open to complete the payment.",
        choose_payment_format: "Choose payment format",
        unified_label: "Unified",
        unified_caption:
            "Combines a bitcoin address and a lightning invoice. Sender chooses payment method.",
        lightning_label: "Lightning invoice",
        lightning_caption:
            "Ideal for small transactions. Usually lower fees than on-chain.",
        onchain_label: "Bitcoin address",
        onchain_caption:
            "On-chain, just like Satoshi did it. Ideal for very large transactions.",
        unified_setup_fee:
            "A lightning setup fee of {{amount}} SATS will be charged if paid over lightning.",
        lightning_setup_fee:
            "A lightning setup fee of {{amount}} SATS will be charged for this receive.",
        amount: "Amount",
        fee: "+ Fee",
        total: "Total",
        spendable: "Spendable",
        channel_size: "Channel size",
        channel_reserve: "- Channel reserve",
        amount_editable: {
            receive_too_small:
                "Your first lightning receive needs to be {{amount}} SATS or greater. A setup fee will be deducted from the requested amount.",
            setup_fee_lightning:
                "A lightning setup fee will be charged if paid over lightning.",
            too_big_for_beta:
                "That's a lot of sats. You do know Mutiny Wallet is still in beta, yeah?",
            more_than_21m: "There are only 21 million bitcoin.",
            set_amount: "Set amount",
            max: "MAX",
            fix_amounts: {
                ten_k: "10k",
                one_hundred_k: "100k",
                one_million: "1m"
            },
            del: "DEL"
        },
        integrated_qr: {
            onchain: "On-chain",
            lightning: "Lightning",
            unified: "Unified"
        }
    },
    send: {
        sending: "Sending...",
        confirm_send: "Confirm Send",
        contact_placeholder: "Add the receiver for your records",
        start_over: "Start Over",
        send_bitcoin: "Send Bitcoin",
        paste: "Paste",
        scan_qr: "Scan QR",
        payment_initiated: "Payment Initiated",
        payment_sent: "Payment Sent",
        destination: "Destination",
        progress_bar: {
            of: "of",
            sats_sent: "sats sent"
        },
        error_low_balance:
            "We do not have enough balance to pay the given amount.",
        error_clipboard: "Clipboard not supported",
        error_keysend: "Keysend failed",
        error_LNURL: "LNURL Pay failed"
    },
    feedback: {
        header: "Give us feedback!",
        received: "Feedback received!",
        thanks: "Thank you for letting us know what's going on.",
        more: "Got more to say?",
        tracking:
            "Mutiny doesn't track or spy on your behavior, so your feedback is incredibly helpful.",
        github: "If you're comfortable with GitHub you can also",
        create_issue: "create an issue.",
        link: "Feedback?",
        feedback_placeholder: "Bugs, feature requests, feedback, etc.",
        info_label: "Include contact info",
        info_caption: "If you need us to follow-up on this issue",
        email: "Email",
        email_caption: "Burners welcome",
        nostr: "Nostr",
        nostr_caption: "Your freshest npub",
        nostr_label: "Nostr npub or NIP-05",
        send_feedback: "Send Feedback",
        invalid_feedback: "Please say something!",
        need_contact: "We need some way to contact you",
        invalid_email: "That doesn't look like an email address to me",
        error: "Error submitting feedback {{error}}",
        try_again: "Please try again later."
    },
    activity: {
        title: "Activity",
        mutiny: "Mutiny",
        nostr: "Nostr",
        view_all: "View all",
        receive_some_sats_to_get_started: "Receive some sats to get started",
        channel_open: "Channel Open",
        channel_close: "Channel Close",
        unknown: "Unknown",
        import_contacts:
            "Import your contacts from nostr to see who they're zapping.",
        coming_soon: "Coming soon"
    },
    redshift: {
        title: "Redshift",
        unknown: "Unknown",
        what_happened: "What happened?",
        starting_amount: "Starting amount",
        fees_paid: "Fees paid",
        change: "Change",
        outbound_channel: "Outbound channel",
        return_channel: "Return channel",
        where_this_goes: "Where is this going?",
        watch_it_go: "Watch it go!",
        choose_your: "Choose your",
        utxo_to_begin: "UTXO to begin",
        unshifted_utxo: "Unshifted UTXOs",
        redshifted: "Redshifted",
        utxos: "UTXOs",
        no_utxos_empty_state: "No utxos (empty state)",
        utxo_label: "UTXO",
        utxo_caption: "Trade in your UTXO for a fresh UTXO",
        lightning_label: "Lightning",
        lightning_caption: "Convert your UTXO into Lightning",
        oh_dear: "Oh dear",
        here_is_error: "Here's what happened:"
    },
    scanner: {
        paste: "Paste Something",
        cancel: "Cancel"
    },
    settings: {
        header: "Settings",
        support: "Learn how to support Mutiny",
        general: "GENERAL",
        beta_features: "BETA FEATURES",
        debug_tools: "DEBUG TOOLS",
        danger_zone: "Danger zone",
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
                no_nodes: "No nodes"
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
            have_channels: "You have",
            have_channels_one: "lightning channel.",
            have_channels_many: "lightning channels.",
            inbound_outbound_tip:
                "Outbound is the amount of money you can spend on lightning. Inbound is the amount you can receive without incurring a lightning service fee.",
            no_channels:
                "It looks like you don't have any channels yet. To get started, receive some sats over lightning, or swap some on-chain funds into a channel. Get your hands dirty!"
        },
        connections: {
            title: "Wallet Connections",
            error_name: "Name cannot be empty",
            error_connection: "Failed to create Wallet Connection",
            add_connection: "Add Connection",
            manage_connections: "Manage Connections",
            disable_connection: "Disable",
            enable_connection: "Enable",
            new_connection: "New Connection",
            new_connection_label: "Name",
            new_connection_placeholder: "My favorite nostr client...",
            create_connection: "Create Connection",
            relay: "Relay",
            authorize:
                "Authorize external services to request payments from your wallet. Pairs great with Nostr clients.",
            pending_nwc: {
                title: "Pending Requests",
                configure_link: "Configure"
            }
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
                download_logs: "Download Logs"
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
            error_match: "Passwords do not match"
        },
        decrypt: {
            title: "Enter your password",
            decrypt_wallet: "Decrypt Wallet",
            forgot_password_link: "Forgot Password?",
            error_wrong_password: "Invalid Password"
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
            more: "... and more to come"
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
            error_lsp: "That doesn't look like a URL",
            save: "Save"
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
    error: {
        title: "Error",
        emergency_link: "emergency kit.",
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
                    "Mutiny currently only supports use in one tab at a time. It looks like you have another tab open with Mutiny running. Please close that tab and refresh this page, or close this tab and refresh the other one."
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
                support_link: "reach out to us for support."
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
        beta_warning: {
            title: "Warning: beta software",
            beta_warning:
                "We're so glad you're here. But we do want to warn you: Mutiny Wallet is in beta, and there are still bugs and rough edges.",
            be_careful:
                "Please be careful and don't put more money into Mutiny than you're willing to lose.",
            beta_link: "Learn more about the beta",
            pretend_money:
                "If you want to use pretend money to test out Mutiny without risk,",
            signet_link: "check out our Signet version."
        },
        transaction_details: {
            lightning_receive: "Lightning receive",
            lightning_send: "Lightning send",
            channel_open: "Channel open",
            channel_close: "Channel close",
            onchain_receive: "On-chain receive",
            onchain_send: "On-chain send",
            paid: "Paid",
            unpaid: "Unpaid",
            status: "Status",
            when: "When",
            description: "Description",
            fee: "Fee",
            fees: "Fees",
            bolt11: "Bolt11",
            payment_hash: "Payment Hash",
            preimage: "Preimage",
            txid: "Txid",
            balance: "Balance",
            reserve: "Reserve",
            peer: "Peer",
            channel_id: "Channel ID",
            reason: "Reasson",
            confirmed: "Confirmed",
            unconfirmed: "Unconfirmed",
            no_details:
                "No channel details found, which means this channel has likely been closed."
        },
        more_info: {
            whats_with_the_fees: "What's with the fees?",
            self_custodial:
                "Mutiny is a self-custodial wallet. To initiate a lightning payment we must open a lightning channel, which requires a minimum amount and a setup fee.",
            future_payments:
                "Future payments, both send and recieve, will only incur normal network fees and a nominal service fee unless your channel runs out of inbound capacity.",
            liquidity: "Learn more about liquidity"
        },
        confirm_dialog: {
            are_you_sure: "Are you sure?",
            cancel: "Cancel",
            confirm: "Confirm"
        }
    }
};

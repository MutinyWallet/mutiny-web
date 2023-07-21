export default {
    common: {
        nice: "Nice",
        home: "Home",
        sats: "SATS",
        sat: "SAT",
        usd: "USD",
        fee: "Fee",
        send: "Send",
        receive: "Receive",
        dangit: "Dangit",
        back: "Back"
    },
    char: {
        del: "DEL"
    },
    receive: {
        receive_bitcoin: "Receive Bitcoin",
        edit: "Edit",
        checking: "Checking",
        choose_format: "Choose format",
        payment_received: "Payment Received",
        payment_initiated: "Payment Initiated",
        receive_add_the_sender: "Add the sender for your records",
        amount_editable: {
            receive_too_small:
                "Your first lightning receive needs to be {{amount}} sats or greater. A setup fee will be deducted from the requested amount.",
            setup_fee_lightning:
                "A lightning setup fee will be charged if paid over lightning.",
            too_big_for_beta:
                "That's a lot of sats. You do know Mutiny Wallet is still in beta, yeah?",
            more_than_21m:
                "There are only 21 million bitcoin.",
            set_amount: "Set amount",
            max: "MAX"
        }
    },
    send: {
        sending: "Sending...",
        confirm_send: "Confirm Send",
        contact_placeholder: "Add the receiver for your records",
        start_over: "Start Over",
        progress_bar: {
            of: "of",
            sats_sent: "sats sent"
        }
    },
    feedback: {
        header: "Give us feedback!",
        received: "Feedback received!",
        thanks: "Thank you for letting us know what's going on.",
        more: "Got more to say?",
        tracking:
            "Mutiny doesn't track or spy on your behavior, so your feedback is incredibly helpful.",
        github_one: "If you're comfortable with GitHub you can also",
        github_two: ".",
        create_issue: "create an issue",
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
        error: "Error submitting feedback",
        try_again: "Please try again later."
    },
    activity: {
        view_all: "View all",
        receive_some_sats_to_get_started: "Receive some sats to get started",
        channel_open: "Channel Open",
        channel_close: "Channel Close",
        unknown: "Unknown"
    },
    redshift: {},
    scanner: {
        paste: "Paste Something",
        cancel: "Cancel"
    },
    settings: {
        header: "Settings",
        mutiny_plus: "MUTINY+",
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
                "These are internal tools we use to debug and test the app. Please be careful!"
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
            authorize:
                "Authorize external services to request payments from your wallet. Pairs great with Nostr clients."
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
        encrypt: {},
        lnurl_auth: {
            title: "LNURL Auth"
        },
        plus: {},
        restore: {
            title: "Restore"
        },
        servers: {
            title: "Servers",
            caption: "Don't trust us! Use your own servers to back Mutiny."
        }
    },
    swap: {
        peer_not_found: "Peer not found",
        channel_too_small:
            "It's just silly to make a channel smaller than {{amount}} sats",
        insufficient_funds: "You don't have enough funds to make this channel",
        header: "Swap to Lightning",
        initiated: "Swap Initiated",
        sats_added: "sats will be added to your Lightning balance",
        use_existing: "Use existing peer",
        choose_peer: "Choose a peer",
        peer_connect_label: "Connect to new peer",
        peer_connect_placeholder: "Peer connect string",
        connect: "Connect",
        connecting: "Connecting...",
        confirm_swap: "Confirm Swap"
    },
    error: {
        load_time: {
            stuck: "Stuck on this screen? Try reloading. If that doesn't work, check out the",
            emergency_link: "emergency kit."
        },
        not_found: {
            title: "Not Found",
            wtf_paul: "This is probably Paul's fault."
        }
    },
    create_an_issue: "Create an issue",
    send_bitcoin: "Send Bitcoin",
    view_transaction: "View Transaction",
    why: "Why?",
    more_info_modal_p1:
        "Mutiny is a self-custodial wallet. To initiate a lightning payment we must open a lightning channel, which requires a minimum amount and a setup fee.",
    more_info_modal_p2:
        "Future payments, both send and recieve, will only incur normal network fees and a nominal service fee unless your channel runs out of inbound capacity.",
    learn_more_about_liquidity: "Learn more about liquidity",
    whats_with_the_fees: "What's with the fees?",
    private_tags: "Private tags",
    continue: "Continue",
    keep_mutiny_open: "Keep Mutiny open to complete the payment."
};

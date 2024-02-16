export default {
    common: {
        title: "Mutiny 지갑",
        nice: "멋지다",
        home: "홈",
        sats: "SATS",
        sat: "SAT",
        usd: "USD",
        fee: "수수료",
        send: "보내기",
        receive: "받기",
        dangit: "땡글",
        back: "뒤로",
        coming_soon: "(곧 출시 예정)",
        copy: "복사",
        copied: "복사됨",
        continue: "계속",
        error_unimplemented: "미구현",
        why: "왜?",
        view_transaction: "거래 보기",
        private_tags: "비공개 태그",
        pending: "대기 중"
    },
    contacts: {
        new: "새로 만들기",
        add_contact: "연락처 추가",
        new_contact: "새 연락처",
        create_contact: "연락처 생성",
        edit_contact: "연락처 수정",
        save_contact: "연락처 저장",
        payment_history: "결제 기록",
        no_payments: "아직 결제 기록이 없습니다.",
        edit: "수정",
        pay: "지불",
        name: "이름",
        placeholder: "사토시",
        unimplemented: "미구현",
        not_available: "아직 제공되지 않습니다.",
        error_name: "이름은 필수입니다."
    },
    receive: {
        receive_bitcoin: "비트코인 받기",
        edit: "수정",
        checking: "확인 중",
        choose_format: "포맷 선택",
        payment_received: "결제 완료",
        payment_initiated: "결제 시작됨",
        receive_add_the_sender: "송신자를 기록에 추가하세요.",
        choose_payment_format: "결제 포맷 선택",
        unified_label: "통합",
        unified_caption:
            "비트코인 주소와 라이트닝 인보이스를 결합합니다. 송신자가 결제 방법을 선택합니다.",
        lightning_label: "라이트닝 인보이스",
        lightning_caption:
            "작은 거래에 적합합니다. 보통 온체인 수수료보다 낮습니다.",
        onchain_label: "비트코인 주소",
        onchain_caption:
            "온체인, 사토시가 한 것처럼. 아주 큰 거래에 적합합니다.",
        unified_setup_fee:
            "라이트닝으로 지불하는 경우 {{amount}} SATS의 라이트닝 설치 비용이 부과됩니다.",
        lightning_setup_fee:
            "이 받기에는 {{amount}} SATS의 라이트닝 설치 비용이 부과됩니다.",
        amount: "금액",
        fee: "+ 수수료",
        total: "합계",
        spendable: "사용 가능",
        channel_size: "채널 크기",
        channel_reserve: "- 채널 예비금",
        amount_editable: {
            receive_too_small:
                "첫 라이트닝 받기는 {{amount}} SATS 이상이어야 합니다. 요청한 금액에서 설정 비용이 차감됩니다.",
            setup_fee_lightning:
                "라이트닝으로 지불하는 경우 라이트닝 설치 비용이 부과됩니다.",
            more_than_21m: "비트코인은 총 2,100만 개밖에 없습니다.",
            set_amount: "금액 설정",
            max: "최대",
            fix_amounts: {
                ten_k: "1만",
                one_hundred_k: "10만",
                one_million: "100만"
            },
            del: "삭제"
        },
        integrated_qr: {
            onchain: "온체인",
            lightning: "라이트닝",
            unified: "통합"
        }
    },
    send: {
        sending: "보내는 중...",
        confirm_send: "보내기 확인",
        contact_placeholder: "기록을 위해 수신자 추가",
        start_over: "다시 시작",
        paste: "붙여넣기",
        scan_qr: "QR 스캔",
        payment_initiated: "결제 시작됨",
        payment_sent: "결제 완료",
        destination: "수신처",
        progress_bar: {
            of: "/",
            sats_sent: "SATS 보냄"
        },
        error_low_balance: "지불할 금액보다 충분한 잔액이 없습니다.",
        error_clipboard: "클립보드를 지원하지 않습니다.",
        error_keysend: "KeySend 실패",
        error_LNURL: "LNURL Pay 실패"
    },
    feedback: {
        header: "피드백 주세요!",
        received: "피드백이 수신되었습니다!",
        thanks: "문제가 발생했음을 알려주셔서 감사합니다.",
        more: "더 하실 말씀이 있으신가요?",
        tracking:
            "Mutiny는 사용자 행동을 추적하거나 감시하지 않기 때문에 피드백이 매우 유용합니다.",
        github_one: "GitHub에 익숙하시다면",
        github_two: "를 사용하여",
        create_issue: "이슈를 생성하세요",
        link: "피드백?",
        feedback_placeholder: "버그, 기능 요청, 피드백 등",
        info_label: "연락처 정보 포함",
        info_caption: "문제에 대한 후속 조치를 필요로 하는 경우",
        email: "이메일",
        email_caption: "일회용 이메일 사용 가능",
        nostr: "Nostr",
        nostr_caption: "신선한 npub",
        nostr_label: "Nostr npub 또는 NIP-05",
        send_feedback: "피드백 보내기",
        invalid_feedback: "피드백을 입력하세요.",
        need_contact: "연락처 정보가 필요합니다.",
        invalid_email: "올바른 이메일 주소가 아닙니다.",
        error: "피드백 전송 오류",
        try_again: "나중에 다시 시도하세요."
    },
    activity: {
        title: "활동",
        mutiny: "Mutiny",
        nostr: "Nostr",
        view_all: "전체 보기",
        receive_some_sats_to_get_started: "시작하려면 일부 SATS를 받으세요",
        channel_open: "채널 오픈",
        channel_close: "채널 닫기",
        unknown: "알 수 없음",
        import_contacts:
            "Nostr에서 연락처를 가져와 누가 체널을 열고 있는지 확인하세요.",
        coming_soon: "곧 출시 예정",
        transaction_details: {
            lightning_receive: "라이트닝 입금",
            lightning_send: "라이트닝 송금",
            channel_open: "채널 개설",
            channel_close: "채널 종료",
            onchain_receive: "체인상 입금",
            onchain_send: "체인상 송금",
            paid: "지불 완료",
            unpaid: "미지불",
            status: "상태",
            when: "시간",
            description: "설명",
            fee: "수수료",
            fees: "수수료",
            bolt11: "Bolt11",
            payment_hash: "지불 해시",
            preimage: "사전 이미지",
            txid: "거래 ID",
            balance: "잔고",
            reserve: "리저브",
            peer: "피어",
            channel_id: "채널 ID",
            reason: "이유",
            confirmed: "확인됨",
            unconfirmed: "확인 대기",
            no_details:
                "채널 상세정보를 찾을 수 없습니다. 이는 해당 채널이 종료된 것으로 보입니다."
        }
    },
    scanner: {
        paste: "붙여넣기",
        cancel: "취소"
    },
    settings: {
        header: "설정",
        support: "Mutiny 지원 방법 알아보기",
        general: "일반",
        experimental_features: "실험",
        debug_tools: "디버그 도구",
        danger_zone: "위험 지역",
        admin: {
            title: "관리자 페이지",
            caption: "내부 디버그 도구입니다. 신중하게 사용하세요!",
            header: "비밀 디버그 도구",
            warning_one: "잘 알고 있는 경우 올바른 위치입니다.",
            warning_two:
                "디버그 및 테스트에 사용하는 내부 도구입니다. 주의하세요!",
            kitchen_sink: {
                disconnect: "연결 끊기",
                peers: "피어",
                no_peers: "피어 없음",
                refresh_peers: "피어 새로고침",
                connect_peer: "피어 연결",
                expect_a_value: "값을 입력하세요...",
                connect: "연결",
                close_channel: "채널 종료",
                force_close: "강제 종료",
                abandon_channel: "채널 포기",
                confirm_close_channel: "이 채널을 종료하시겠습니까?",
                confirm_force_close:
                    "이 채널을 강제로 종료하시겠습니까? 자금은 몇 일 이후에 체인상에서 사용 가능해집니다.",
                confirm_abandon_channel:
                    "이 채널을 포기하시겠습니까? 대개 개방 트랜잭션이 확인되지 않는다면 이렇게 하십시오. 그렇지 않으면 자금을 잃게 될 수 있습니다.",
                channels: "채널",
                no_channels: "채널 없음",
                refresh_channels: "채널 새로고침",
                pubkey: "퍼블릭 키",
                amount: "금액",
                open_channel: "채널 개설",
                nodes: "노드",
                no_nodes: "노드 없음"
            }
        },
        backup: {
            title: "백업",
            secure_funds: "자금을 안전하게 보호하세요.",
            twelve_words_tip:
                "12개의 단어를 보여드립니다. 12개의 단어를 기록하세요.",
            warning_one:
                "브라우저 기록을 지우거나 기기를 분실하면 이 12개의 단어만으로 지갑을 복원할 수 있습니다.",
            warning_two:
                "Mutiny는 사용자의 자산을 사용자 스스로 관리해야 합니다...",
            confirm: "12개의 단어를 기록했습니다.",
            responsibility: "자금이 사용자 스스로의 책임임을 이해합니다.",
            liar: "속이려는 것이 아닙니다.",
            seed_words: {
                reveal: "씨드 단어 공개",
                hide: "숨기기",
                copy: "클립보드에 복사",
                copied: "복사됨!"
            }
        },
        channels: {
            title: "라이트닝 채널",
            outbound: "송신",
            inbound: "수신",
            have_channels: "라이트닝 채널이",
            have_channels_one: "개 있습니다.",
            have_channels_many: "개 있습니다.",
            inbound_outbound_tip:
                "송신은 라이트닝으로 지출할 수 있는 금액을 나타냅니다. 수신은 수수료 없이 받을 수 있는 금액을 나타냅니다.",
            no_channels:
                "아직 채널이 없는 것 같습니다. 먼저 라이트닝으로 몇 sats를 받거나 체인상 자금을 채널로 바꾸세요. 시작해보세요!"
        },
        connections: {
            title: "지갑 연결",
            error_name: "이름을 입력하세요.",
            error_connection: "지갑 연결 생성에 실패했습니다.",
            add_connection: "연결 추가",
            manage_connections: "연결 관리",
            disable_connection: "비활성화",
            enable_connection: "활성화",
            new_connection: "새로운 연결",
            new_connection_label: "이름",
            new_connection_placeholder: "내가 좋아하는 nostr 클라이언트...",
            create_connection: "연결 생성",
            open_app: "앱 열기",
            open_in_nostr_client: "Nostr 클라이언트에서 열기",
            open_in_primal: "Primal에서 열기",
            authorize:
                "외부 서비스가 지갑에서 결제를 요청할 수 있도록 인증합니다. nostr 클라이언트와 잘 맞습니다.",
            pending_nwc: {
                title: "대기 중인 요청",
                configure_link: "설정"
            }
        },
        emergency_kit: {
            title: "비상 키트",
            caption: "지갑 문제를 진단하고 해결하는 도구입니다.",
            emergency_tip:
                "지갑이 망가지는 것 같다면 이 도구를 사용하여 문제를 진단하고 해결하세요.",
            questions:
                "이 버튼들이 무엇을 하는지 궁금하다면, 지원을 받으시려면",
            link: "연락처를 통해 문의해주세요.",
            import_export: {
                title: "지갑 상태 내보내기",
                error_password: "비밀번호가 필요합니다.",
                error_read_file: "파일 읽기 오류",
                error_no_text: "파일에서 텍스트를 찾을 수 없습니다.",
                tip: "Mutiny 지갑 상태 전체를 파일로 내보내서 새 브라우저에 가져와서 복원할 수 있습니다. 보통 동작합니다!",
                caveat_header: "주의 사항:",
                caveat: "내보낸 후에는 원래 브라우저에서 아무 동작도 수행하지 마세요. 그렇게 하면 다시 내보내야 합니다. 성공적인 가져오기 후에는 원래 브라우저의 상태를 초기화하는 것이 좋습니다.",
                save_state: "상태를 파일로 저장",
                import_state: "파일에서 상태 가져오기",
                confirm_replace: "상태를 다음으로 대체하시겠습니까?",
                password: "복호화를 위해 비밀번호 입력",
                decrypt_wallet: "지갑 복호화"
            },
            logs: {
                title: "디버그 로그 다운로드",
                something_screwy: "문제가 발생했나요? 로그를 확인하세요!",
                download_logs: "로그 다운로드"
            },
            delete_everything: {
                delete: "모두 삭제",
                confirm: "노드 상태가 모두 삭제됩니다. 복구할 수 없습니다!",
                deleted: "삭제됨",
                deleted_description: "모든 데이터 삭제됨"
            }
        },
        encrypt: {
            header: "시드 단어 암호화",
            hot_wallet_warning:
                "Mutiny는 &rdquo;핫 월렛&rdquo;이므로 시드 단어를 사용하여 작동하지만 선택적으로 비밀번호로 암호화할 수 있습니다.",
            password_tip:
                "이렇게 하면 다른 사람이 브라우저에 접근하더라도 자금에 접근할 수 없습니다.",
            optional: "(선택 사항)",
            existing_password: "기존 비밀번호",
            existing_password_caption:
                "비밀번호를 설정하지 않았다면 비워 두세요.",
            new_password_label: "비밀번호",
            new_password_placeholder: "비밀번호를 입력하세요",
            new_password_caption:
                "이 비밀번호는 시드 단어를 암호화하는 데 사용됩니다. 이를 잊어버리면 자금에 접근하려면 시드 단어를 다시 입력해야 합니다. 시드 단어를 기록해 두었나요?",
            confirm_password_label: "비밀번호 확인",
            confirm_password_placeholder: "동일한 비밀번호를 입력하세요",
            encrypt: "암호화",
            skip: "건너뛰기",
            error_match: "비밀번호가 일치하지 않습니다."
        },

        decrypt: {
            title: "비밀번호를 입력하세요",
            decrypt_wallet: "지갑 복호화",
            forgot_password_link: "비밀번호를 잊으셨나요?",
            error_wrong_password: "유효하지 않은 비밀번호"
        },
        lnurl_auth: {
            title: "LNURL 인증",
            auth: "인증",
            expected: "LNURL과 같은 형식으로 입력해주세요."
        },
        plus: {
            title: "Mutiny+",
            join: "가입",
            for: "에 대해",
            sats_per_month: "sats 월별 비용입니다.",
            you_need: "적어도 다음 금액이 필요합니다.",
            lightning_balance:
                "라이트닝 잔액에서 sats를 지불하세요. 먼저 시험해보세요!",
            restore: "구독 복원",
            ready_to_join: "가입할 준비가 되었습니다.",
            click_confirm: "첫 달 비용을 지불하려면 확인을 클릭하세요.",
            open_source: "Mutiny는 오픈 소스이며 스스로 호스팅할 수 있습니다.",
            optional_pay: "또한 지불할 수도 있습니다.",
            paying_for: "지불 대상:",
            supports_dev:
                "는 지속적인 개발을 지원하고 새 기능과 프리미엄 기능의 조기 액세스를 제공합니다.",
            thanks: "Mutiny의 일원이 되셨습니다! 다음 혜택을 즐기세요:",
            renewal_time: "다음 시기에 갱신 요청이 도착합니다.",
            cancel: "구독을 취소하려면 결제하지 않으세요. 또는 Mutiny+ 기능을 비활성화할 수도 있습니다.",
            wallet_connection: "지갑 연결 기능.",
            subscribe: "구독하기",
            error_no_plan: "",
            error_failure: "",
            error_no_subscription: "기존 구독이 없습니다.",
            satisfaction: "만족함",
            gifting: "선물하기",
            multi_device: "다중 장치 접속",
            more: "... 그리고 더 많은 기능이 추가될 예정입니다."
        },
        restore: {
            title: "복원",
            all_twelve: "12개 단어를 모두 입력해야 합니다.",
            wrong_word: "잘못된 단어",
            paste: "클립보드에서 붙여넣기 (위험)",
            confirm_text:
                "이 지갑으로 복원하시겠습니까? 기존 지갑이 삭제됩니다!",
            restore_tip:
                "기존 Mutiny 지갑을 12개의 씨드 단어로 복원할 수 있습니다. 기존 지갑이 대체됩니다. 신중하게 사용하세요!",
            multi_browser_warning: "여러 브라우저에서 동시에 사용하지 마세요.",
            error_clipboard: "클립보드를 지원하지 않습니다.",
            error_word_number: "잘못된 단어 개수",
            error_invalid_seed: "잘못된 씨드 단어입니다."
        },
        servers: {
            title: "서버",
            caption:
                "우리를 믿지 마세요! Mutiny를 백업하기 위해 자체 서버를 사용하세요.",
            link: "자체 호스팅에 대해 자세히 알아보기",
            proxy_label: "웹소켓 프록시",
            proxy_caption: "라이트닝 노드가 네트워크와 통신하는 방법입니다.",
            error_proxy: "wss://로 시작하는 URL이어야 합니다.",
            esplora_label: "Esplora",
            esplora_caption: "온체인 정보를 위한 블록 데이터입니다.",
            error_esplora: "URL처럼 보이지 않습니다.",
            rgs_label: "RGS",
            rgs_caption:
                "Rapid Gossip Sync. 라우팅을 위해 사용되는 라이트닝 네트워크에 대한 네트워크 데이터입니다.",
            error_rgs: "URL처럼 보이지 않습니다.",
            lsp_label: "LSP",
            lsp_caption:
                "라이트닝 서비스 공급자. 인바운드 유동성을 위해 자동으로 채널을 열고, 개인 정보 보호를 위해 인보이스를 래핑합니다.",
            error_lsp: "URL처럼 보이지 않습니다.",
            save: "저장"
        }
    },
    swap: {
        peer_not_found: "피어를 찾을 수 없음",
        channel_too_small:
            "{{amount}} sats보다 작은 채널을 만드는 것은 그저 어리석은 짓입니다.",
        insufficient_funds: "이 채널을 만들기에 충분한 자금이 없습니다.",
        header: "라이트닝으로 스왑",
        initiated: "스왑 시작됨",
        sats_added: "sats가 라이트닝 잔액에 추가됩니다.",
        use_existing: "기존 피어 사용",
        choose_peer: "피어 선택",
        peer_connect_label: "새 피어 연결",
        peer_connect_placeholder: "피어 연결 문자열",
        connect: "연결",
        connecting: "연결 중...",
        confirm_swap: "스왑 확인"
    },
    error: {
        title: "오류",
        emergency_link: "긴급 킷.",
        restart: "문제가 *더* 발생했나요? 노드를 중지하세요!",
        general: {
            oh_no: "앗!",
            never_should_happen: "이런 일은 일어나면 안 됩니다.",
            try_reloading:
                "이 페이지를 새로 고치거나 &rdquo;얘들아&rdquo; 버튼을 눌러보세요. 계속해서 문제가 발생하면",
            support_link: "지원을 요청하세요.",
            getting_desperate: "좀 답답하신가요? 다음을 시도해보세요."
        },
        load_time: {
            stuck: "이 화면에 멈춰있나요? 다시 로드해보세요. 그래도 동작하지 않으면 다음을 확인하세요."
        },
        not_found: {
            title: "찾을 수 없음",
            wtf_paul: "이건 아마 폴의 잘못입니다."
        },
        reset_router: {
            payments_failing:
                "결제 실패하고 있나요? 라이트닝 라우터를 초기화해보세요.",
            reset_router: "라우터 초기화"
        },
        resync: {
            incorrect_balance:
                "온체인 잔액이 잘못된 것 같나요? 온체인 월렛을 다시 동기화해보세요.",
            resync_wallet: "월렛 다시 동기화"
        },
        on_boot: {
            existing_tab: {
                title: "여러 탭 감지됨",
                description:
                    "현재 Mutiny Wallet을 한 번에 한 탭에서만 사용할 수 있습니다. Mutiny가 실행 중인 다른 탭이 열려 있습니다. 해당 탭을 닫고 이 페이지를 새로 고치거나, 이 탭을 닫고 다른 탭을 새로 고치세요."
            },
            incompatible_browser: {
                title: "호환되지 않는 브라우저",
                header: "호환되지 않는 브라우저가 감지되었습니다.",
                description:
                    "Mutiny Wallet은 WebAssembly, LocalStorage 및 IndexedDB를 지원하는 현대적인 브라우저를 필요로 합니다. 일부 브라우저는 이러한 기능을 비활성화하는 경우도 있습니다.",
                try_different_browser:
                    "이러한 모든 기능을 지원하는 브라우저를 사용하는지 확인하거나 다른 브라우저를 시도하세요. 또는 이러한 기능을 차단하는 특정 확장 기능이나 &rdquo;보호 기능&rdquo;을 비활성화해보세요.",
                browser_storage:
                    "(더 많은 프라이버시 브라우저를 지원하고 싶지만, 월렛 데이터를 브라우저 저장소에 저장해야 하므로 그렇게 할 수 없습니다. )",
                browsers_link: "지원되는 브라우저"
            },
            loading_failed: {
                title: "로드 실패",
                header: "Mutiny 로드 실패",
                description:
                    "Mutiny Wallet을 부팅하는 동안 문제가 발생했습니다.",
                repair_options:
                    "월렛이 손상된 것 같다면, 디버그 및 복구를 시도하기 위한 몇 가지 도구입니다.",
                questions: "이러한 버튼이 무엇을 하는지 궁금하다면,",
                support_link: "지원을 요청하세요."
            }
        }
    },
    modals: {
        share: "공유",
        details: "상세정보",
        loading: {
            loading: "로딩 중:",
            default: "시작 중",
            double_checking: "검증 중",
            downloading: "다운로드 중",
            setup: "설정 중",
            done: "완료"
        },
        onboarding: {
            welcome: "환영합니다!",
            restore_from_backup:
                "이미 Mutiny를 사용한 적이 있으시다면 백업에서 복원할 수 있습니다. 그렇지 않다면 이 단계를 건너뛰고 새로운 지갑을 즐기실 수 있습니다!",
            not_available: "아직 이 기능은 지원하지 않습니다",
            secure_your_funds: "자금을 안전하게 보호하세요"
        },
        more_info: {
            whats_with_the_fees: "수수료는 어떻게 되나요?",
            self_custodial:
                "Mutiny는 자체 보관 월렛입니다. 라이트닝 지불을 시작하려면 라이트닝 채널을 개설해야 하며, 이는 최소 금액과 설정 비용이 필요합니다.",
            future_payments:
                "앞으로의 송금 및 입금은 일반 네트워크 수수료와 노말 서비스 수수료만 부과되며, 채널에 인바운드 용량이 부족한 경우에만 추가 수수료가 발생합니다.",
            liquidity: "유동성에 대해 자세히 알아보기"
        },
        confirm_dialog: {
            are_you_sure: "확실합니까?",
            cancel: "취소",
            confirm: "확인"
        }
    },
    create_an_issue: "이슈 생성",
    send_bitcoin: "비트코인 전송",
    continue: "계속하기",
    keep_mutiny_open: "결제를 완료하기 위해 Mutiny를 열어두세요."
};

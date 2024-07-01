import { MutinyFederationIdentity } from "~/routes/settings";

export function federationWarning(federations: MutinyFederationIdentity[]) {
    const FEDERATIONS_WITH_WARNINGS = [
        // Freedom One
        "c944b2fd1e7fe04ca87f9a57d7894cb69116cec6264cb52faa71228f4ec54cd6",
        // Bitcoin Principles
        "b21068c84f5b12ca4fdf93f3e443d3bd7c27e8642d0d52ea2e4dce6fdbbee9df"
    ];

    let expiration_warning:
        | {
              expiresTimestamp: number;
              expiresMessage: string;
              federationName: string;
          }
        | undefined = undefined;

    federations.forEach((f) => {
        if (f.popup_countdown_message && f.popup_end_timestamp) {
            expiration_warning = {
                expiresTimestamp: f.popup_end_timestamp,
                expiresMessage: f.popup_countdown_message,
                federationName: f.federation_name
            };
        } else if (FEDERATIONS_WITH_WARNINGS.includes(f.federation_id)) {
            // If the federation has no expiration warning we'll do a generic one
            expiration_warning = {
                expiresTimestamp: 0,
                expiresMessage: "",
                federationName: ""
            };
        }
    });

    return expiration_warning;
}

import { ContactItem } from "~/state/contacts";

async function generateGradientFromHashedString(str: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const digestBuffer = await crypto.subtle.digest('SHA-256', data);
    const digestArray = new Uint8Array(digestBuffer);
    const h1 = digestArray[0] % 360;
    const h2 = (h1 + 180) % 360;

    const gradient = `linear-gradient(135deg, hsl(${h1}, 50%, 50%) 0%, hsl(${h2}, 50%, 50%) 100%)`;

    return gradient;
}

export async function gradientsPerContact(contacts: ContactItem[]) {
    // 
    // let gradients: { [key: string]: string } = {};
    let gradients = new Map();
    for (const contact of contacts) {
        const gradient = await generateGradientFromHashedString(contact.name);
        gradients.set(contact.id, gradient);
    }

    return gradients;
}
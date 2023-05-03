export type TagItem = TextItem | ContactItem;

export type TextItem = {
    id: string;
    kind: "text";
    name: string;
}

export type ContactItem = {
    id: string;
    kind: "contact";
    name: string;
    npub?: string;
    color: Color;
}

export type Color = "blue" | "green" | "red" | "gray"

export const createUniqueId = () => Math.random().toString(36).substr(2, 9);

export async function listContacts(): Promise<ContactItem[]> {
    // get contacts from localstorage
    const contacts: ContactItem[] = JSON.parse(localStorage.getItem("contacts") || "[]");
    return contacts;
}

export async function listTexts(): Promise<TextItem[]> {
    // get texts from localstorage
    const texts: TextItem[] = JSON.parse(localStorage.getItem("texts") || "[]");
    return texts;
}

export async function listTags(): Promise<TagItem[]> {
    const contacts = await listContacts();
    const texts = await listTexts();
    return [...contacts, ...texts];
}

export async function addContact(contact: ContactItem): Promise<void> {
    const contacts = await listContacts();
    contacts.push(contact);
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

export async function addTextTag(text: TextItem): Promise<void> {
    const texts = await listTexts();
    texts.push(text);
    localStorage.setItem("texts", JSON.stringify(texts));
}



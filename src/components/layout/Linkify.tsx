import { JSX } from 'solid-js';

interface LinkifyProps {
    text: string;
}

// chat gpt wrote this lol
export default function Linkify(props: LinkifyProps): JSX.Element {
    const { text } = props;
    const links: (string | JSX.Element)[] = [];

    const pattern = /((https?:\/\/|www\.)\S+)/gi;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        const link = match[1];
        const href = link.startsWith('http') ? link : `https://${link}`;
        const beforeLink = text.slice(lastIndex, match.index);
        lastIndex = pattern.lastIndex;

        if (beforeLink) {
            links.push(beforeLink);
        }

        links.push(<a href={href} target="_blank" rel="noopener noreferrer">{link}</a>);
    }

    const remainingText = text.slice(lastIndex);
    if (remainingText) {
        links.push(remainingText);
    }

    return <>{links}</>;
}
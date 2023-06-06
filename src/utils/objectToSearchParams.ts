export function objectToSearchParams<
    T extends Record<string, string | undefined>
>(obj: T): string {
    return (
        Object.entries(obj)
            .filter(([_, value]) => value !== undefined)
            // Value shouldn't be null we just filtered it out but typescript is dumb
            .map(([key, value]) =>
                value
                    ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                    : ""
            )
            .join("&")
    );
}

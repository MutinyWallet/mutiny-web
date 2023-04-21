// Take in a string that looks like this:
// bitcoin:tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe?amount=0.00001&label=heyo&lightning=lntbs10u1pjrwrdedq8dpjhjmcnp4qd60w268ve0jencwzhz048ruprkxefhj0va2uspgj4q42azdg89uupp5gngy2pqte5q5uvnwcxwl2t8fsdlla5s6xl8aar4xcsvxeus2w2pqsp5n5jp3pz3vpu92p3uswttxmw79a5lc566herwh3f2amwz2sp6f9tq9qyysgqcqpcxqrpwugv5m534ww5ukcf6sdw2m75f2ntjfh3gzeqay649256yvtecgnhjyugf74zakaf56sdh66ec9fqep2kvu6xv09gcwkv36rrkm38ylqsgpw3yfjl
// and return an object with this shape: { address: string, amount: number, label: string, lightning: string }
// using typescript type annotations
export function bip21decode(bip21: string): { address?: string, amount?: number, label?: string, lightning?: string } {
    const [scheme, data] = bip21.split(':')
    if (scheme !== 'bitcoin') {
        // TODO: this is a WAILA job I just want to debug more of the send flow
        if (bip21.startsWith('lnt')) {
            return { lightning: bip21 }
        } else if (bip21.startsWith('tb1')) {
            return { address: bip21 }
        } else {
            throw new Error('Not a bitcoin URI')
        }
    }
    const [address, query] = data.split('?')
    const params = new URLSearchParams(query)
    return {
        address,
        amount: Number(params.get('amount')) || undefined,
        label: params.get('label') || undefined,
        lightning: params.get('lightning') || undefined
    }
}
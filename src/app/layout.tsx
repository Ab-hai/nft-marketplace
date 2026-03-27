import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/Header"
import { type ReactNode } from "react"
import { Providers } from "./providers"
import { useEffect , useState} from "react"
import { useAccount } from "wagmi"

export const metadata: Metadata = {
    title: "NftMarketplace",
    description: "A non-custodial marketplace for NFTs",
}

export default function RootLayout(props: { children: ReactNode }) {
 const [isCompliance , setIsCompliance] = useState(true)
    const {address} = useAccount()

useEffect(() => {
        if(address) { checkCompliance ()}
    },[address])


    async function checkCompliance() {
        if (!address) return
        const response = await fetch("/api/compliance" , {
            method : "POST",
            headers : {
                "Content-Type " : "application/json",
            },
            body : JSON.stringify({address})
        })
        const result = await response.json()
        setIsCompliance(result.success && result.isApproved)
    }

    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/nft-marketplace.png" sizes="any" />
            </head>
            <body className="bg-zinc-50">
                <Providers>
                    <Header />
                    {props.children}
                </Providers>
            </body>
        </html>
    )
}

"use client"

import { useAccount } from "wagmi"
import RecentlyListedNFTs from "@/components/RecentlyListed"
import { useState , useEffect } from "react"

export default function Home() {
    const { isConnected } = useAccount()
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
        <main>
            {!isConnected ? (
                <div className="flex items-center justify-center p-4 md:p-6 xl:p-8">
                    Please connect a wallet
                </div>
            ) : (
                isCompliance ? (
                <div className="flex items-center justify-center p-4 md:p-6 xl:p-8">
                    <RecentlyListedNFTs />
                </div>) : (
                    <div>
                        You are deined!
                    </div>
                )
            )}
        </main>
    )
}

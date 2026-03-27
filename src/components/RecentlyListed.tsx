import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import NFTBox from "./NFTBox"
import Link from "next/link"

// Main component that uses the custom hook
interface NFTItem {
    rindexerId: number
    seller: string
    nftAddress: string
    tokenId: string
    price: string
    blockNumber: number
    txHash: string
    contractAddress: string
}

interface BoughtCanceledItem {
    nftAddress: string
    tokenId: string
}

interface NFTQueryResponse {
    data: {
        allItemListeds: {
            nodes: NFTItem[]
        }
        allItemBoughts: {
            nodes: BoughtCanceledItem[]
        }
        allItemCanceleds: {
            nodes: BoughtCanceledItem[]
        }
    }
}

const GET_RECENT_NFTS = `
  query GetRecentlyListedNFTs {
    allItemListeds(
      first: 20,
      orderBy: [BLOCK_NUMBER_DESC, TX_INDEX_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        rindexerId
        seller
        nftAddress
        tokenId
        price
        contractAddress
        blockNumber
        txHash
      }
    }
    
    allItemBoughts {
      nodes {
        nftAddress
        tokenId
      }
    }
    
    allItemCanceleds {
      nodes {
        nftAddress
        tokenId
      }
    }
  }
`

async function fetchNFTs(): Promise<NFTQueryResponse> {
    const response = await fetch("/api/graphql",{
        method : "POST",
        headers :{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: GET_RECENT_NFTS,
        }),
    })
    return response.json()
}


function useRecentlyListedNFTs() {
    const {data, isLoading, error} = useQuery<NFTQueryResponse>({
        queryKey: ["recentNFTs"],
        queryFn : fetchNFTs,
    })

    const nftDataList = useMemo(() => {
        if(!data) return []

        const boughtNFTs = new Set<string>()
        const cancelledNFTs = new Set<string>()

        data.data.allItemBoughts.nodes.forEach((item) => {
            boughtNFTs.add(`${item.nftAddress} - ${item.tokenId}`)
        })

         data.data.allItemCanceleds.nodes.forEach((item) => {
            cancelledNFTs.add(`${item.nftAddress} - ${item.tokenId}`)
        })

        const availNfts = data.data.allItemListeds.nodes.filter(item => {
            if(!item.nftAddress || !item.tokenId) return false
            const key = `${item.nftAddress} - ${item.tokenId}`
            return !boughtNFTs.has(key) && !cancelledNFTs.has(key)
        })

        const recentNFTs = availNfts.slice(0,100)

        return recentNFTs.map(nft => ({
            tokenId: nft.tokenId,
            contractAddress: nft.contractAddress,
            price: nft.price
        }))
     }, [data] )

     return {isLoading , error , nftDataList}
}

export default function RecentlyListedNFTs() {

const {isLoading , error, nftDataList} = useRecentlyListedNFTs()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mt-8 text-center">
                <Link
                    href="/list-nft"
                    className="inline-block py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    List Your NFT
                </Link>
            </div>
            <h2 className="text-2xl font-bold mb-6">Recently Listed NFTs</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
               {nftDataList.map(nft => (
                <Link href={`/but-nft/${nft.contractAddress}/${nft.tokenId}`}
                 key={`${nft.contractAddress} - ${nft.tokenId}`} >
                      <NFTBox 
                      key={`${nft.contractAddress} - ${nft.tokenId}`} 
                      tokenId= {nft.tokenId}
                      contractAddress= {nft.contractAddress}
                      price={nft.price}
                      />
                      </Link>
               ))}
            </div>
        </div>
    )
}
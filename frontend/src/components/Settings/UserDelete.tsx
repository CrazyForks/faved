"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useContext } from "react"
import { StoreContext } from "@/store/storeContext"




export function UserDelete() {
  const store = useContext(StoreContext);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Disable authentication</CardTitle>
        <CardDescription>
          Disabling authentication will remove your user account and disable login functionality.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={store.deleteUser} variant="destructive" className="w-full">Disable authentication</Button>
      </CardFooter>
    </Card >
  )
}

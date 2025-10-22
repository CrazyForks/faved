"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StoreContext } from "@/store/storeContext"
import { observer } from "mobx-react-lite"



export const PresetActions = observer(() => {
  const store = React.useContext(StoreContext);

  return (
    <Button variant="secondary" size="icon" onClick={() => {
      store.setPreSelectedItemSettingsModal(null)
      store.setIsOpenSettingsModal(true)
    }}>
      <span className="sr-only">Actions</span>
      <SlidersHorizontal />
    </Button>
  )
})

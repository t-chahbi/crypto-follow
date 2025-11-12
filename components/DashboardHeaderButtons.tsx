'use client'

import { Button } from "@heroui/react"
import Link from "next/link"

export default function DashboardHeaderButtons() {
    return (
        <div className="flex gap-4">
            <Button as={Link} href="/portfolio" color="primary" variant="flat">
                Portefeuille
            </Button>
            <Button as={Link} href="/alerts" color="secondary" variant="flat">
                Alertes
            </Button>
        </div>
    )
}

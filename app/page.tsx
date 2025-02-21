"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const filterOptions = [
  { value: "numbers", label: "Numbers" },
  { value: "alphabets", label: "Alphabets" },
  { value: "highest_alphabet", label: "Highest Alphabet" },
]

export default function Home() {
  const [input, setInput] = useState('{"data": []}')
  const [response, setResponse] = useState<any>(null)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      let parsedInput
      try {
        parsedInput = JSON.parse(input)
        if (!parsedInput.data || !Array.isArray(parsedInput.data)) {
          throw new Error('Input must be in the format {"data": []}')
        }
      } catch (parseError) {
        setError('Invalid JSON input. Please use the format {"data": []}')
        return
      }

      const res = await fetch("/api/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedInput),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "API request failed")
      }

      setResponse(data)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      setResponse(null)
    }
  }

  const toggleFilter = (value: string) => {
    setSelectedFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const removeFilter = (value: string) => {
    setSelectedFilters((current) => current.filter((item) => item !== value))
  }

  const getFilteredResponse = () => {
    if (!response || selectedFilters.length === 0) return null

    const filteredResult: Record<string, any> = {}
    selectedFilters.forEach((filter) => {
      if (filter === "numbers") {
        filteredResult.Numbers = response.numbers.join(",")
      } else if (filter === "alphabets") {
        filteredResult.Alphabets = response.alphabets.join(",")
      } else if (filter === "highest_alphabet") {
        filteredResult["Highest Alphabet"] = response.highest_alphabet[0] || ""
      }
    })

    return filteredResult
  }

  const filteredResponse = getFilteredResponse()

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">BFHL App</h1>
      <Card>
        <CardHeader>
          <CardTitle>API Input</CardTitle>
          <CardDescription>Enter data in the format {"{'data': []}"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"data": ["A","1","B","2"]}'
              className="font-mono"
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Multi Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedFilters.map((filter) => {
                const option = filterOptions.find((opt) => opt.value === filter)
                return (
                  <Badge key={filter} variant="secondary" className="py-1 px-2">
                    {option?.label}
                    <button className="ml-1 hover:bg-muted rounded-full" onClick={() => removeFilter(filter)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                  Select filters...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search filters..." />
                  <CommandList>
                    <CommandEmpty>No filter found.</CommandEmpty>
                    <CommandGroup>
                      {filterOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            toggleFilter(option.value)
                          }}
                        >
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {filteredResponse && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Filtered Response</h3>
                {Object.entries(filteredResponse).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="font-medium">{key}: </span>
                    {value}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  )
}


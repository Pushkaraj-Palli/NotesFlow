"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pin, MoreVertical, Edit, Trash2, Calendar } from "lucide-react"
import type { Note } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  index: number
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin, index }: NoteCardProps) {
  const cardColors = [
    "from-primary/10 to-accent/5 border-primary/20",
    "from-accent/10 to-success/5 border-accent/20",
    "from-success/10 to-primary/5 border-success/20",
    "from-warning/10 to-accent/5 border-warning/20",
  ]
  const colorIndex = index % cardColors.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card
        className={`h-full border shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${cardColors[colorIndex]} backdrop-blur-sm hover:scale-[1.02]`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {note.isPinned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Pin className="w-4 h-4 text-accent fill-current" />
                  </motion.div>
                )}
                <h3 className="font-semibold text-lg truncate text-balance">{note.title}</h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 text-primary" />
                <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTogglePin(note._id.toString())} className="hover:bg-accent/10">
                  <Pin className="mr-2 h-4 w-4 text-accent" />
                  {note.isPinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(note)} className="hover:bg-primary/10">
                  <Edit className="mr-2 h-4 w-4 text-primary" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(note._id.toString())}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 text-pretty">{note.content}</p>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 3).map((tag, tagIndex) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`text-xs ${
                    tagIndex === 0
                      ? "bg-primary/20 text-primary border-primary/30"
                      : tagIndex === 1
                        ? "bg-accent/20 text-accent border-accent/30"
                        : "bg-success/20 text-success border-success/30"
                  }`}
                >
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

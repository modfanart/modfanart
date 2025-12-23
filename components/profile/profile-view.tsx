import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/lib/db/models/user"
import { ExternalLink, Twitter, Instagram, Facebook, Globe } from "lucide-react"
import Link from "next/link"

interface ProfileViewProps {
  user: User
  isPublic?: boolean
}

export function ProfileView({ user, isPublic = false }: ProfileViewProps) {
  // Get user initials for avatar fallback
  const userInitials = user.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImageUrl || ""} alt={user.name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {user.bio && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          </div>
        )}

        <div className="space-y-2">
          {user.website && (
            <div className="flex items-center text-sm">
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
              <Link
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                {user.website.replace(/^https?:\/\/(www\.)?/, "")}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          )}

          {user.socialLinks?.twitter && (
            <div className="flex items-center text-sm">
              <Twitter className="mr-2 h-4 w-4 text-muted-foreground" />
              <Link
                href={user.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                {user.socialLinks.twitter.replace(/^https?:\/\/(www\.)?(twitter\.com\/)?/, "@")}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          )}

          {user.socialLinks?.instagram && (
            <div className="flex items-center text-sm">
              <Instagram className="mr-2 h-4 w-4 text-muted-foreground" />
              <Link
                href={user.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                {user.socialLinks.instagram.replace(/^https?:\/\/(www\.)?(instagram\.com\/)?/, "@")}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          )}

          {user.socialLinks?.facebook && (
            <div className="flex items-center text-sm">
              <Facebook className="mr-2 h-4 w-4 text-muted-foreground" />
              <Link
                href={user.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center"
              >
                {user.socialLinks.facebook.replace(/^https?:\/\/(www\.)?(facebook\.com\/)?/, "")}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {!isPublic && (
          <div className="mt-4 pt-4 border-t">
            <Link href="/profile" className="text-sm text-primary hover:underline">
              Edit Profile
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


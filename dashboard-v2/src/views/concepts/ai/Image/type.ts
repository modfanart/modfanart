export type ConfigsVariant =
    | 'aspectRatio'
    | 'style'
    | 'tone'
    | 'lighting'
    | 'camera'

export type GelleryItem = {
    id: string
    image: string
    prompt: string
    size: string
    like: string
    ratio: string
}

export type Gallery = GelleryItem[]

export type GeneratorConfigs = Record<ConfigsVariant, string>

export type GetImageResponse = {
    data: Gallery
    loadable: boolean
}

export type PostImageResponse = Gallery

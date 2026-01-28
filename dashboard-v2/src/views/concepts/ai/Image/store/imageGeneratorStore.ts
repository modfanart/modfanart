import { create } from 'zustand'
import { Gallery, GelleryItem, ConfigsVariant, GeneratorConfigs } from '../type'

type ImageDialog = {
    open: boolean
    props: Partial<GelleryItem> & {
        type?: 'generated' | 'existing'
    }
}

type ImageGeneratorState = {
    isGeneratedImagesView: boolean
    isGeneratingImage: boolean
    generatedImage: Gallery
    generatorConfig: GeneratorConfigs
    imageDialog: ImageDialog
}

type ImageGeneratorAction = {
    setGeneratorConfig: (payload: {
        key: ConfigsVariant
        value: string
    }) => void
    resetGeneratorConfig: () => void
    setImageDialog: (payload: ImageDialog) => void
    onGenerateImage: () => void
    onGenerateImageComplete: () => void
    setGeneratedImage: (payload: Gallery) => void
}

const defaultGeneratoConfig = {
    aspectRatio: 'lanscape',
    style: 'noStyle',
    tone: 'noTone',
    lighting: 'noLighting',
    camera: 'noCamera',
}

const initialState: ImageGeneratorState = {
    isGeneratedImagesView: false,
    isGeneratingImage: false,
    generatedImage: [],
    generatorConfig: { ...defaultGeneratoConfig },
    imageDialog: {
        open: false,
        props: {},
    },
}

export const useImageGeneratorStore = create<
    ImageGeneratorState & ImageGeneratorAction
>((set, get) => ({
    ...initialState,
    setGeneratorConfig: ({ key, value }) =>
        set(() => {
            const generatorConfig = get().generatorConfig
            generatorConfig[key] = value
            return { generatorConfig }
        }),
    resetGeneratorConfig: () =>
        set(() => ({ generatorConfig: { ...defaultGeneratoConfig } })),
    setImageDialog: (payload) => set(() => ({ imageDialog: payload })),
    onGenerateImage: () =>
        set(() => ({
            isGeneratedImagesView: true,
            isGeneratingImage: true,
        })),
    onGenerateImageComplete: () =>
        set(() => ({
            isGeneratingImage: false,
        })),
    setGeneratedImage: (payload) =>
        set(() => ({
            generatedImage: payload,
        })),
}))

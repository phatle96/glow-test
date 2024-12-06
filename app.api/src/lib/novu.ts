import { Novu } from "@novu/node";

export const createNovuInstance = () => {
    if (!process.env.NOVU_API_SECRET_KEY) {
        console.warn('NOVU_API_SECRET_KEY is not set');
        return null;
    }

    return new Novu(process.env.NOVU_API_SECRET_KEY);
}
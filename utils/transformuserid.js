// utils/transformuserid.js
/**
 * Extrait l'ID utilisateur à partir d'une chaîne qui peut être :
 * - une mention (@123456)
 * - un numéro (123456)
 * - un JID complet (123456@s.whatsapp.net)
 * Retourne l'ID numérique ou null si invalide.
 */
export function transformUserIdAdvanced(input) {
    if (!input) return null;
    // Supprimer tous les caractères non numériques
    const digits = input.replace(/[^0-9]/g, '');
    // Un ID WhatsApp a généralement au moins 7 chiffres
    if (digits.length >= 7) {
        return digits;
    }
    return null;
}
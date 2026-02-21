// Tests unitaires — utilitaires
import { describe, it, expect } from "vitest";
import {
  generateSlug,
  formatDuration,
  formatDate,
  formatViews,
  truncate,
  isSubscriptionActive,
  calculateTotalPages,
} from "@/lib/utils";

describe("generateSlug", () => {
  it("génère un slug valide à partir d'un titre", () => {
    expect(generateSlug("Mon Super Tutoriel")).toBe("mon-super-tutoriel");
  });

  it("supprime les accents", () => {
    expect(generateSlug("Cybersécurité pour débutants")).toBe(
      "cybersecurite-pour-debutants"
    );
  });

  it("supprime les caractères spéciaux", () => {
    expect(generateSlug("Tuto: Hacking éthique (2024)!")).toBe(
      "tuto-hacking-ethique-2024"
    );
  });

  it("gère les espaces multiples", () => {
    expect(generateSlug("  Titre  avec   espaces  ")).toBe(
      "titre-avec-espaces"
    );
  });

  it("limite la longueur à 100 caractères", () => {
    const longTitle = "A".repeat(200);
    expect(generateSlug(longTitle).length).toBeLessThanOrEqual(100);
  });
});

describe("formatDuration", () => {
  it("formate les secondes uniquement", () => {
    expect(formatDuration(45)).toBe("45s");
  });

  it("formate les minutes et secondes", () => {
    expect(formatDuration(125)).toBe("2min 5s");
  });

  it("formate les heures, minutes et secondes", () => {
    expect(formatDuration(3723)).toBe("1h 2min 3s");
  });

  it("retourne vide pour 0", () => {
    expect(formatDuration(0)).toBe("");
  });
});

describe("formatViews", () => {
  it("formate les vues inférieures à 1000", () => {
    expect(formatViews(1)).toBe("1 vue");
    expect(formatViews(999)).toBe("999 vues");
  });

  it("formate les milliers", () => {
    expect(formatViews(1500)).toBe("1.5k vues");
  });

  it("formate les millions", () => {
    expect(formatViews(1_500_000)).toBe("1.5M vues");
  });
});

describe("truncate", () => {
  it("ne tronque pas si inférieur à maxLength", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("tronque et ajoute les points de suspension", () => {
    const result = truncate("Hello World!", 8);
    expect(result).toContain("…");
    expect(result.length).toBeLessThanOrEqual(9);
  });
});

describe("isSubscriptionActive", () => {
  it("retourne false pour un abonnement null", () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it("retourne false pour un statut non-ACTIVE", () => {
    expect(
      isSubscriptionActive({
        status: "CANCELLED",
        currentPeriodEnd: new Date(Date.now() + 86400000),
      })
    ).toBe(false);
  });

  it("retourne false pour un abonnement expiré", () => {
    expect(
      isSubscriptionActive({
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() - 86400000), // Hier
      })
    ).toBe(false);
  });

  it("retourne true pour un abonnement actif valide", () => {
    expect(
      isSubscriptionActive({
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() + 86400000), // Demain
      })
    ).toBe(true);
  });
});

describe("calculateTotalPages", () => {
  it("calcule le nombre de pages correctement", () => {
    expect(calculateTotalPages(100, 12)).toBe(9);
    expect(calculateTotalPages(12, 12)).toBe(1);
    expect(calculateTotalPages(0, 12)).toBe(0);
  });
});

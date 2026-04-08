// ─── facts.js ────────────────────────────────────────────────
// Facts arrays and fact panel 

const facts = [
    {
        range: [0, 450],
        text: "Psyche's axial tilt of ~95° causes extreme seasons, where poles face the Sun directly during parts of the orbit."
    },
    {
        range: [450, 900],
        text: "Unlike Earth where the equator is warmest, Psyche's sideways rotation means the poles receive the most intense seasonal heating."
    },
    {
        range: [900, 1350],
        text: "Due to the high tilt, one pole experiences continuous sunlight for about 2.5 Earth years, mimicking a 2.5 year long summer day."
    },
    {
        range: [1350, 1800],
        text: "The opposite pole endures darkness for the same duration, resulting in a long 'winter' night."
    },
    {
        range: [1800, 2250],
        text: "Temperature swings of 240°F can occur on Psyche between its sunlit and shadowed poles during different seasons."
    },
    {
        range: [2250, 2700],
        text: "At the warmest, Psyche's surface reaches only -100°F (-70°C). At the poles during winter, temperatures plunge to -340°F (-200°C)."
    },
    {
        range: [2700, 3150],
        text: "During Psyche's polar winter, temperatures plunge to -340°F—cold enough to freeze carbon dioxide into dry ice and turn gases like methane and ammonia into solid ice crystals in the shadowed polar craters."
    },
    {
        range: [3150, 3600],
        text: "The temperature difference between Psyche's sunlit and shadowed hemispheres can exceed 240°F, creating extreme thermal stress on the asteroid's metallic surface."
    }
];

const generalFacts = [
    {
        range: [0, 450],
        text: "Psyche's elliptical orbit brings it as close as 235 million miles to the Sun and as far as 309 million miles away."
    },
    {
        range: [450, 900],
        text: "Psyche's orbital eccentricity of about 0.14 means its distance from the Sun varies by about 74 million miles between its closest and farthest points."
    },
    {
        range: [900, 1350],
        text: "Due to its elliptical orbit, Psyche moves faster when closer to the Sun (perihelion) and slower when farther away (aphelion), following Kepler's laws of planetary motion."
    },
    {
        range: [1350, 1800],
        text: "The rapid 4.2-hour rotation (Psyche's \"day\") means the asteroid rotates over 10,000 times per orbit around the sun (Psyche's \"year\")."
    },
    {
        range: [1800, 2250],
        text: "Despite being only 1% of the Moon's mass, Psyche may contain more iron-nickel metal than has ever been mined on Earth throughout human history."
    },
    {
        range: [2250, 2700],
        text: "Psyche measures approximately 280 kilometers (173 miles) across at its widest point—roughly the distance from Los Angeles to San Diego."
    },
    {
        range: [2700, 3150],
        text: "Psyche may be the exposed iron-nickel core of a planetesimal that lost its outer layers in ancient collisions, offering a rare glimpse into planetary interiors normally hidden beneath rock and ice."
    },
    {
        range: [3150, 3600],
        text: "Psyche may help us understand how terrestrial planets like Earth, Mars, Venus, and Mercury formed their iron cores during the chaotic early years of solar system history—a period when planetary bodies were still colliding and separating into distinct layers."
    }
];

function updateFacts(angle) {
    let currentFact = facts[0].text;
    for (const fact of facts) {
        if (angle >= fact.range[0] && angle < fact.range[1]) {
            currentFact = fact.text;
            break;
        }
    }
    const infoBody = infoBox.querySelector('.info-box-body');
    if (infoBody) { infoBody.textContent = currentFact; } else { infoBox.textContent = currentFact; }

    let currentGeneralFact = generalFacts[0].text;
    for (const fact of generalFacts) {
        if (angle >= fact.range[0] && angle < fact.range[1]) {
            currentGeneralFact = fact.text;
            break;
        }
    }
    const generalBody = generalInfoBox.querySelector('.info-box-body');
    if (generalBody) { generalBody.textContent = currentGeneralFact; } else { generalInfoBox.textContent = currentGeneralFact; }
}

const driver = require("./db");

async function seed() {
  const session = driver.session();

  try {
    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    await session.run(`
      CREATE
      (hyderabad:Destination {name: "Hyderabad", country: "India"}),
      (delhi:Destination {name: "Delhi", country: "India"}),
      (jaipur:Destination {name: "Jaipur", country: "India"}),
      (goa:Destination {name: "Goa", country: "India"}),
      (mumbai:Destination {name: "Mumbai", country: "India"}),

      (charminar:Attraction {name: "Charminar"}),
      (golconda:Attraction {name: "Golconda Fort"}),
      (redfort:Attraction {name: "Red Fort"}),
      (amber:Attraction {name: "Amber Fort"}),
      (beach:Attraction {name: "Baga Beach"}),
      (gateway:Attraction {name: "Gateway of India"}),

      (history:Interest {name: "History"}),
      (culture:Interest {name: "Culture"}),
      (food:Interest {name: "Food"}),
      (beaches:Interest {name: "Beaches"}),
      (architecture:Interest {name: "Architecture"}),

      (hyderabad)-[:HAS_ATTRACTION]->(charminar),
      (hyderabad)-[:HAS_ATTRACTION]->(golconda),
      (delhi)-[:HAS_ATTRACTION]->(redfort),
      (jaipur)-[:HAS_ATTRACTION]->(amber),
      (goa)-[:HAS_ATTRACTION]->(beach),
      (mumbai)-[:HAS_ATTRACTION]->(gateway),

      (hyderabad)-[:HAS_INTEREST]->(history),
      (hyderabad)-[:HAS_INTEREST]->(culture),
      (delhi)-[:HAS_INTEREST]->(history),
      (delhi)-[:HAS_INTEREST]->(architecture),
      (jaipur)-[:HAS_INTEREST]->(history),
      (jaipur)-[:HAS_INTEREST]->(architecture),
      (goa)-[:HAS_INTEREST]->(beaches),
      (goa)-[:HAS_INTEREST]->(food),
      (mumbai)-[:HAS_INTEREST]->(food),
      (mumbai)-[:HAS_INTEREST]->(culture),

      (hyderabad)-[:CONNECTED_TO]->(delhi),
      (hyderabad)-[:CONNECTED_TO]->(jaipur),
      (hyderabad)-[:CONNECTED_TO]->(mumbai),
      (delhi)-[:CONNECTED_TO]->(jaipur),
      (mumbai)-[:CONNECTED_TO]->(goa),

      (history)-[:RELATED_TO]->(culture),
      (culture)-[:RELATED_TO]->(architecture),
      (food)-[:RELATED_TO]->(culture)
    `);

    console.log("✅ TravelPath database seeded!");
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
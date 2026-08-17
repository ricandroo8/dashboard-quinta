export const mockF1Data = {
  nextRace: {
    id: "race-italy-2026",
    name: "Gran Premio d'Italia",
    circuit: "Autodromo Nazionale di Monza",
    country: "Italia",
    round: 16,
    startDate: "2026-09-06T15:00:00+02:00",
  },

  drivers: [
    {
      id: "driver-norris",
      position: 1,
      name: "Lando Norris",
      code: "NOR",
      team: "McLaren",
      points: 275,
    },
    {
      id: "driver-verstappen",
      position: 2,
      name: "Max Verstappen",
      code: "VER",
      team: "Red Bull Racing",
      points: 249,
    },
    {
      id: "driver-leclerc",
      position: 3,
      name: "Charles Leclerc",
      code: "LEC",
      team: "Ferrari",
      points: 198,
    },
  ],

  constructors: [
    {
      id: "constructor-mclaren",
      position: 1,
      name: "McLaren",
      points: 430,
    },
    {
      id: "constructor-ferrari",
      position: 2,
      name: "Ferrari",
      points: 355,
    },
    {
      id: "constructor-red-bull",
      position: 3,
      name: "Red Bull Racing",
      points: 321,
    },
  ],
};
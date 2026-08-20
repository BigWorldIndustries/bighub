<script lang="ts">
  import PrizeGalleries from '$lib/components/olympics/PrizeGalleries.svelte';
</script>

<svelte:head>
  <title>Big World Olympics | BigHub</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <header class="mb-12">
    <h1 class="text-4xl font-bold text-white mb-4 drop-shadow-md">What are the Big World Olympics?</h1>
    <h2 class="text-2xl text-gray-200 drop-shadow-sm">...and what's in it for me?</h2>
    <div class="flex justify-center mt-6">
      <a href="/olympics/signup" class="btn variant-filled-primary">
        Sign up for Big World Olympics 2026
      </a>
    </div>
  </header>

  <article class="prose prose-lg max-w-none prose-invert">
    <p class="mb-6 text-gray-100">
        The Big World Olympics is a gaming event spanning multiple weeks and multiple games that brings
        casual and competitive players alike to compete for medals and prizes, and have some fun. It 
        doesn't matter what games you're into, you can choose to play in one event or all of them. It's
        completely free to play, and totally up to you how much you want to get involved.
    </p>

    <h2 class="text-2xl text-gray-200 drop-shadow-sm">Big World Olympics 2026</h2>
    <p class="mb-6 text-gray-100">
        Big World Olympics 2026 is happening in September 2026, and for the 
        first time, will involve <b>multiple Discord servers</b> competing against each other as their 
        own house. If you are part of a Discord server or community that would be interested in participating, 
        please <a href="/olympics/signup">sign up here</a> and share with your community.
    </p>

    <h2 class="text-2xl text-gray-200 drop-shadow-sm">Big World Olympics 2024</h2>
    <p class="mb-6 text-gray-100">
        Big World Olympics 2024 took place from January 12-30 2024, and involved 3 teams, 30+ players, 20+ events across 15+ different games.
        A special Big World Olympics card set was created, and every player that participated had a custom card made for them. Every participant was
        shipped a booster pack + a holo version of their card. Top 3 participants in each event won an official custom-made 
        Big World Olympics medal.
    </p>

    <div class="mb-12">
        <PrizeGalleries />
    </div>

    <section class="mb-12">
        <h1 class="text-3xl font-bold text-white mb-8">Events</h1>
      
        <div class="space-y-8">
          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Smash 1v1s</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Mr. Gommi</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Mr. X</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Eller</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Gears 2v2</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Team</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Steeb & Zazu</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Noonz & Tony</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Gears FFA</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Steeb</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Noonz</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Zazu</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Gang Beasts Ball</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Team</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Em, Steeb, Zazu</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Noonz, Tony, Johan</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">BigDaddy, Sojinx, Picodrop</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Gang Beasts FFA</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">BigDaddy</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Johan</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Em</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Yugioh</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Capt. Enigma</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Raven</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Hunter</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Legends of Runeterra</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Raven</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">BigDaddy</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Steeb</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Teamfight Tactics</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Raven</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">NeonMuffin</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Shroomies</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Chess</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Kat</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Shroomies</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Gubb</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Skribble</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Tony</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Steeb</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Raven</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Halo - Sumo Event</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Johan</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">NeonMuffin</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Zazu</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Halo - Hot Potato Event</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Steeb</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Zazu</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">NeonMuffin</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Halo - Competitive FFA</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Noonz</td>
                    <td class="px-6 py-4 text-gray-100">Maharnegonia</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Steeb</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">3rd</td>
                    <td class="px-6 py-4 text-gray-100">Zazu</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 class="text-2xl text-gray-200 mb-4">Fall Guys</h2>
            <div class="overflow-x-auto">
              <table class="w-full max-w-2xl mx-auto border-collapse table table-hover">
                <thead>
                  <tr class="bg-gray-800">
                    <th class="px-6 py-3 text-left text-gray-200">Place</th>
                    <th class="px-6 py-3 text-left text-gray-200">Name</th>
                    <th class="px-6 py-3 text-left text-gray-200">Faction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">1st</td>
                    <td class="px-6 py-4 text-gray-100">Steeb</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Sojinx, NeonMuffin, Capt. Enigma</td>
                    <td class="px-6 py-4 text-gray-100">Zazuland</td>
                  </tr>
                  <tr class="border-b border-gray-700">
                    <td class="px-6 py-4 text-gray-100">2nd</td>
                    <td class="px-6 py-4 text-gray-100">Zazu</td>
                    <td class="px-6 py-4 text-gray-100">Shneibler Isles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- <div>
            <h2 class="text-2xl text-gray-200 mb-4">Card Set</h2>
            <p class="text-gray-100 mb-4">Cards were created for each participant of the 2024 Olympics. The full set is available here:</p>
            <p>
              <a href="https://imgur.com/gallery/T1Bt6yu" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="text-blue-400 hover:text-blue-300 transition-colors">
                View Card Gallery
              </a>
            </p>
          </div>
        </div> -->
      </section>
  </article>
</div>

<style>
  /* Add any custom styles here if needed */
</style> 
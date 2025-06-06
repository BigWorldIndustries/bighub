<script lang="ts">
  // Page metadata
  import { page } from '$app/stores';
  import {fade} from 'svelte/transition'
  import { onMount } from 'svelte';
  
  const carouselPhotos = [
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/Bwo2024-cards.webp?alt=media&token=50dbfc99-6776-4779-89fa-f1d7d3bdbd58',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/eller.JPG?alt=media&token=c093be7d-4ac4-4043-930a-ccdc98803079',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/zaz2.JPG?alt=media&token=d157e0c7-5aec-4a44-bcec-cfe898eeba98',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/em.JPG?alt=media&token=d30fbf11-10a1-435b-810e-14f17d001a41',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/eric.JPG?alt=media&token=5c1e67a6-2b6f-4ffa-8520-487f74976b28',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/evo.JPG?alt=media&token=2e13d124-3c48-4b39-be3e-eab68f257d23',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/jason.JPG?alt=media&token=7b157198-76a4-4c9b-ab81-4b1dd6b43f47',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/johan.JPG?alt=media&token=e2bae363-908a-4743-a8ea-d3ce76514daf',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/kalzen.JPG?alt=media&token=f9cb6455-79b3-4acf-b845-faee34c94495',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/neonmuffin.JPG?alt=media&token=ab4c7d8d-88c1-4038-9c35-85922f624208',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/johan2.JPG?alt=media&token=9531ce29-3f2a-45b1-abb0-3007042610ed',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/raven.JPG?alt=media&token=293aa09f-5944-42b1-8aae-14565c8670ed',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/zaz.JPG?alt=media&token=e5abbd1a-27bc-4c30-9226-7fe1dbebe96c',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/raven2.JPG?alt=media&token=ff94e79f-cba4-480d-b7cd-bb1005c68957',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/gubb.JPG?alt=media&token=7cd869a1-18f7-4144-af77-8766ed3b0ee8',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/tnp.JPG?alt=media&token=dc3d1a1b-5d79-4c6d-b487-3a701767aeb2',
      'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/steeb.JPG?alt=media&token=1198b334-4e71-4d5a-8964-5c8a1b4a538c'
  ]

  const carouselPhotos2 = [
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F15c6bd5899666540aab5e22dbc79f7d83ecc369a.png?alt=media&token=20d79785-e17b-4f34-bad8-fa2b215107fc',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F186f4b3d99a71f5e15867893e6d626b5be861b55.png?alt=media&token=af34c66e-fafd-41f3-a2cc-07864fa3e855',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F245f00ea7a6e11362658fa0a71b73efc6fdbd81f.png?alt=media&token=3a00ad91-7fad-470d-aeed-f2209e95c981',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F4120976829b643b9c7aa9506f4815324300b361b.png?alt=media&token=659fb7c5-348a-485f-87a7-b97a4a58c544',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F43e241c1580b935d9ee222a7510e198751704440.png?alt=media&token=f5f5e3a2-3032-4e14-8e9b-2f6b540297b9',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F4d45c6a0df15c3de75573dffdb292473871af321.png?alt=media&token=3b7d53f8-583a-46eb-b36f-0ccad58a5a31',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F58d7996e8000f0c23f8f733cd41cd0cdfd513820.png?alt=media&token=c8f04687-45ce-4a1d-b154-f6955944b3fe',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F5924226dc85c62572e90293902d8ac2b06fd38f0.png?alt=media&token=8d754580-3a10-48f9-9c87-fba466316f7e',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F6f4649aa8de31672d560e87d8df2d0422c1a46a4.png?alt=media&token=f0dec61a-41c4-444f-b137-3bb3445f22b4',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F734d53c8201f517eb86fa64c9209ad659ec5b264.png?alt=media&token=fd942b16-d40b-4096-b045-c1bb1fdfe8c5',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F7be827fe1fc59076304eacaff3fa18d9ec8c2da2.png?alt=media&token=b3a3cb66-ecf4-4131-8c34-f04f4fcfdad1',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F8876a4c2c953b238d20f840524d53693b7cd20b0.png?alt=media&token=5982e443-54b3-466c-9280-28b9e5a14b46',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F8c615a4d73012459c6719aab3b3f0ba874cb6717.png?alt=media&token=2d765f79-5072-4ce1-955e-0971e36c8dc4',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F964ddbe533e5dccd5566e6db6dd2d1240d729d3e.png?alt=media&token=60c919ad-a7fb-4a00-b83d-df681c6e9257',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2F9a4bf4b1c6cfe73d9abc30e69d10aae12360f49d.png?alt=media&token=281b63eb-6612-4426-9185-c424816c5c74',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fa554554cff777b3ee9e6095705634bcc9e7ba61d.png?alt=media&token=4eda53d4-537a-4bc7-a4c4-e046df9b6d29',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fb2967ec34ed28000b53e9053a5bfacb87fbdf42a.png?alt=media&token=06ae9af0-6f2c-42b1-a4c2-60ba774b761e',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fb9f5f2b709c9ff726942b9bd1396610d1625c1bd.png?alt=media&token=5494c0b0-30f9-4df0-9c48-52967f9138a0',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fbb157f96f1c3c73166965eed2148f67625254816.png?alt=media&token=b9a3ff0d-77ad-4d34-ba92-d20a589b1796',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fc4d704c27820c8c6667cc57d5a4c6d038de3299e.png?alt=media&token=c0a404b7-bc6f-4a82-99a8-b4b3e797fd98',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fd71a9cbb1706df7de10330e5cccd2d1ea64b678b.png?alt=media&token=c73932cb-1421-4eb0-9146-54b9059ee164',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fd82ecc3b5cb64eba1f1a620e3b0cad2e16ee44c4.png?alt=media&token=23694d90-f4c1-49a7-a6bc-30e53961e094',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fdf4dce10335c39b635422bcece31eb73da6822b5.png?alt=media&token=0127d6e6-e990-4d18-a058-ff1eaed061bb',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fe2d5ee98d4ca0570c4d77d1c37055bc434b694a5.png?alt=media&token=daaa6441-bb74-42ab-9aee-e5898f859fa3',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Ff5459ccdd5fedbfce591b9284a90db75f27dcba9.png?alt=media&token=a5ce73d1-44ab-4225-b75b-9e815147f811',
    'https://firebasestorage.googleapis.com/v0/b/bigworld-e4cf4.firebasestorage.app/o/big-world-cards-2024%2Fffd33cdc05fa2e2a65875bb3715b12e94809b2cb.png?alt=media&token=091d5b6b-249b-4992-a5ce-612fec8df479'
  ]
  
  let index = 0
  let index2 = 0
  
  onMount(() => {
      const interval = setInterval(() => {
          index = (index + 1) % carouselPhotos.length;
      }, 3000);
      
      const interval2 = setInterval(() => {
          index2 = (index2 + 1) % carouselPhotos2.length;
      }, 1000);
      
      return () => {
          clearInterval(interval);
          clearInterval(interval2);
      };
  });
</script>

<svelte:head>
  <title>Big World Olympics | BigHub</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <header class="mb-12">
    <h1 class="text-4xl font-bold text-white mb-4 drop-shadow-md">What are the Big World Olympics?</h1>
    <h2 class="text-2xl text-gray-200 drop-shadow-sm">...and what's in it for me?</h2>
  </header>

  <article class="prose prose-lg max-w-none prose-invert">
    <p class="mb-6 text-gray-100">
        The Big World Olympics is a gaming event spanning multiple weeks and multiple games that brings
        casual and competitive players alike to compete for medals and prizes, and have some fun. It 
        doesn't matter what games you're into, you can choose to play in one event or all of them. It's
        completely free to play, and totally up to you how much you want to get involved.
    </p>

    <h2 class="text-2xl text-gray-200 drop-shadow-sm">Big World Olympics 2025</h2>
    <p class="mb-6 text-gray-100">
        Big World Olympics 2025, slated for winter 2025, is in the early planning stages, and for the 
        first time, will involve <b>multiple Discord servers</b> competing against each other as their 
        own nation. If you are part of a Discord server or community that would be interested in participating, 
        please sign this interest form and share with your community: 
        <a href="https://forms.gle/WjAC4NQ1XMrczPkE7" target="_blank">https://forms.gle/WjAC4NQ1XMrczPkE7</a>
    </p>

    <h2 class="text-2xl text-gray-200 drop-shadow-sm">Big World Olympics 2024</h2>
    <p class="mb-6 text-gray-100">
        Big World Olympics 2024 took place from January 12-30 2024, and involved 3 teams, 30+ players, 20+ events across 15+ different games.
        A special Big World Olympics card set was created, and every player that participated had a custom card made for them. Every participant was
        shipped a booster pack + a holo version of their card. Top 3 participants in each event won an official custom-made 
        Big World Olympics medal.
    </p>

    <div class="flex gap-8 mb-12">
        <style>
            .carousel-container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .carousel-image {
                position: absolute;
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 0.5rem;
            }
        </style>

        <div class="relative h-[400px] flex-1">
            <div class="carousel-container">
                {#each [carouselPhotos[index]] as src (index)}
                    <img 
                        class="carousel-image"
                        transition:fade={{ duration: 600 }}
                        {src} 
                        alt="Big World Olympics event" 
                    />	
                {/each}
            </div>
        </div>

        <div class="relative h-[400px] flex-1">
            <div class="carousel-container">
                {#each [carouselPhotos2[index2]] as src (index2)}
                    <img 
                        class="carousel-image"
                        transition:fade={{ duration: 600 }}
                        {src} 
                        alt="Big World Olympics card" 
                    />	
                {/each}
            </div>
        </div>
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
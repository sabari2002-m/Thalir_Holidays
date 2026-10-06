const emojis = {
    Valparai: '🍃',
    Ooty: '🏔️',
    Yercaud: '☕',
    Kanyakumari: '🌅',
    Rameshwaram: '🕉️',
    Varkala: '🏖️',
    Munnar: '🍵'
};

const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
const destinationEmoji = (name) => emojis[name] || '📍';

function displayDestinations() {
    const container = document.getElementById('destinations-container');
    if (!container) return;

    container.innerHTML = window.SITE_DATA.destinations.map((destination) => `
        <a class="destination-card" href="packages.html?destination=${destination.id}">
            <div class="destination-image">
                <img src="${destination.image}" alt="${destination.name}" loading="lazy">
            </div>
            <div class="destination-info">
                <h3>${destinationEmoji(destination.name)} ${destination.name}</h3>
                <div class="destination-state">📍 ${destination.state}</div>
                <p>${destination.description}</p>
                <div class="attractions"><strong>Popular Attractions:</strong><br>${destination.attractions}</div>
            </div>
        </a>
    `).join('');
}

function packageMarkup(pkg) {
    const highlights = pkg.highlights.split(',').map((item) => item.trim()).filter(Boolean);
    const inclusions = pkg.inclusions.split(',').map((item) => item.trim()).filter(Boolean);

    return `
        <article class="package-card">
            <div class="package-header">
                <h3>${pkg.title}</h3>
                <div class="package-destination">${destinationEmoji(pkg.destination)} ${pkg.destination}, ${pkg.state}</div>
            </div>
            <div class="package-body">
                <div class="package-details">
                    <div class="detail-item"><span class="label">Duration</span><span class="value">⏰ ${pkg.duration}</span></div>
                    <div class="detail-item"><span class="label">Starting price</span><span class="value price">${formatCurrency(pkg.price)}</span></div>
                </div>
                <p class="package-description">${pkg.description}</p>
                <div class="package-highlights"><h4>✨ Highlights</h4><ul>${highlights.map((item) => `<li>${item}</li>`).join('')}</ul></div>
                <div class="package-highlights"><h4>📦 Includes</h4><ul>${inclusions.map((item) => `<li>${item}</li>`).join('')}</ul></div>
            </div>
        </article>
    `;
}

function displayPackages(packages) {
    const container = document.getElementById('packages-container');
    if (!container) return;
    container.innerHTML = packages.length ? packages.map(packageMarkup).join('') : '<div class="empty-state"><h3>No packages found</h3><p>Try changing the filters.</p></div>';
}

function setupPackagesPage() {
    const container = document.getElementById('packages-container');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const destinationId = Number(params.get('destination'));
    let packages = window.SITE_DATA.packages.filter((pkg) => !destinationId || pkg.destination_id === destinationId);
    const stateFilter = document.getElementById('stateFilter');
    const priceFilter = document.getElementById('priceFilter');
    const durationFilter = document.getElementById('durationFilter');

    function applyFilters() {
        let filtered = packages.filter((pkg) => stateFilter.value === 'all' || pkg.state === stateFilter.value);
        if (durationFilter.value !== 'all') filtered = filtered.filter((pkg) => pkg.duration.startsWith(`${durationFilter.value} Days`));
        if (priceFilter.value === 'low-to-high') filtered.sort((a, b) => a.price - b.price);
        if (priceFilter.value === 'high-to-low') filtered.sort((a, b) => b.price - a.price);
        displayPackages(filtered);
    }

    [stateFilter, priceFilter, durationFilter].forEach((filter) => filter.addEventListener('change', applyFilters));
    displayPackages(packages);
}

document.addEventListener('DOMContentLoaded', () => {
    displayDestinations();
    setupPackagesPage();
});

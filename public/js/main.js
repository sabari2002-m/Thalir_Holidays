// API Base URL - uses current domain automatically
const API_URL = window.location.origin + '/api';

// State management
let allPackages = [];
let allDestinations = [];

function getAdminAuthHeaders() {
    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) {
        return {};
    }

    return {
        'Authorization': `Basic ${auth}`
    };
}

// Utility function to format currency
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

// Utility function to get destination emoji
function getDestinationEmoji(name) {
    const emojis = {
        'Valparai': '🍃',
        'Ooty': '🏔️',
        'Yercaud': '☕',
        'Kanyakumari': '🌅',
        'Rameshwaram': '🕉️',
        'Varkala': '🏖️',
        'Wayanad': '🌲',
        'Munnar': '🍵',
        'Chikkamagaluru': '☕',
        'Coorg': '🌿',
        'Mysore': '👑'
    };
    return emojis[name] || '📍';
}

// Load destinations for home page
async function loadDestinations() {
    try {
        const response = await fetch(`${API_URL}/destinations`);
        const destinations = await response.json();
        allDestinations = destinations;
        displayDestinations(destinations);
    } catch (error) {
        console.error('Error loading destinations:', error);
        document.getElementById('destinations-container').innerHTML = 
            '<div class="empty-state"><h3>Error loading destinations</h3><p>Please try again later.</p></div>';
    }
}

// Display destinations
function displayDestinations(destinations) {
    const container = document.getElementById('destinations-container');
    
    if (!destinations || destinations.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No destinations found</h3></div>';
        return;
    }

    container.innerHTML = destinations.map(dest => `
        <div class="destination-card" onclick="window.location.href='/packages.html?destination=${dest.id}'">
            <div class="destination-image">
                ${dest.image_url && dest.image_url !== '/images/' + dest.name.toLowerCase() + '.jpg' 
                    ? `<img src="${dest.image_url}" alt="${dest.name}" onerror="this.parentElement.innerHTML='${getDestinationEmoji(dest.name)}'">` 
                    : `<div class="destination-image-placeholder">${getDestinationEmoji(dest.name)}</div>`
                }
            </div>
            <div class="destination-info">
                <h3>${dest.name}</h3>
                <div class="destination-state">📍 ${dest.state}</div>
                <p>${dest.description}</p>
                <div class="attractions">
                    <strong>Popular Attractions:</strong><br>
                    ${dest.popular_attractions}
                </div>
            </div>
        </div>
    `).join('');
}

// Load packages for packages page
async function loadPackages() {
    try {
        // Check if there's a destination filter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const destinationId = urlParams.get('destination');
        
        let url = `${API_URL}/packages`;
        if (destinationId) {
            url = `${API_URL}/packages/destination/${destinationId}`;
        }
        
        const response = await fetch(url);
        const packages = await response.json();
        allPackages = packages;
        displayPackages(packages);
    } catch (error) {
        console.error('Error loading packages:', error);
        document.getElementById('packages-container').innerHTML = 
            '<div class="empty-state"><h3>Error loading packages</h3><p>Please try again later.</p></div>';
    }
}

// Display packages
function displayPackages(packages) {
    const container = document.getElementById('packages-container');
    
    if (!packages || packages.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No packages found</h3></div>';
        return;
    }

    container.innerHTML = packages.map(pkg => {
        const highlights = pkg.highlights ? pkg.highlights.split(',').map(h => h.trim()) : [];
        const inclusions = pkg.inclusions ? pkg.inclusions.split(',').map(i => i.trim()) : [];
        
        return `
            <div class="package-card">
                <div class="package-header">
                    <h3>${pkg.title}</h3>
                    <div class="package-destination">${getDestinationEmoji(pkg.destination_name)} ${pkg.destination_name}, ${pkg.state}</div>
                </div>
                <div class="package-body">
                    <div class="package-details">
                        <div class="detail-item">
                            <span class="label">Duration</span>
                            <span class="value">⏰ ${pkg.duration}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Price</span>
                            <span class="value price">${formatCurrency(pkg.price)}</span>
                        </div>
                    </div>
                    
                    <p class="package-description">${pkg.description}</p>
                    
                    ${highlights.length > 0 ? `
                        <div class="package-highlights">
                            <h4>✨ Highlights</h4>
                            <ul>
                                ${highlights.map(h => `<li>${h}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${inclusions.length > 0 ? `
                        <div class="package-highlights">
                            <h4>📦 Inclusions</h4>
                            <ul>
                                ${inclusions.map(i => `<li>${i}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <button class="book-button" onclick="bookPackage(${pkg.id})">
                        Book This Package
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Book package - redirect to booking page
function bookPackage(packageId) {
    window.location.href = `/booking?package=${packageId}`;
}

// Setup filters for packages page
function setupFilters() {
    const stateFilter = document.getElementById('stateFilter');
    const priceFilter = document.getElementById('priceFilter');
    const durationFilter = document.getElementById('durationFilter');

    if (!stateFilter || !priceFilter || !durationFilter) return;

    const applyFilters = () => {
        let filtered = [...allPackages];

        // State filter
        if (stateFilter.value !== 'all') {
            filtered = filtered.filter(pkg => pkg.state === stateFilter.value);
        }

        // Duration filter
        if (durationFilter.value !== 'all') {
            const days = durationFilter.value;
            filtered = filtered.filter(pkg => pkg.duration.includes(`${days} Day`));
        }

        // Price sort
        if (priceFilter.value === 'low-to-high') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (priceFilter.value === 'high-to-low') {
            filtered.sort((a, b) => b.price - a.price);
        }

        displayPackages(filtered);
    };

    stateFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    durationFilter.addEventListener('change', applyFilters);
}

// Load packages for booking form dropdown
async function loadPackagesForBooking() {
    try {
        const response = await fetch(`${API_URL}/packages`);
        const packages = await response.json();
        
        const select = document.getElementById('package');
        select.innerHTML = '<option value="">Choose a package...</option>' +
            packages.map(pkg => 
                `<option value="${pkg.id}">${pkg.title} - ${pkg.destination_name} (${formatCurrency(pkg.price)})</option>`
            ).join('');

        // Check if package ID is in URL
        const urlParams = new URLSearchParams(window.location.search);
        const packageId = urlParams.get('package');
        if (packageId) {
            select.value = packageId;
            select.dispatchEvent(new Event('change'));
        }
    } catch (error) {
        console.error('Error loading packages:', error);
    }
}

// Setup booking form submission
function setupBookingForm() {
    const form = document.getElementById('bookingForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Collect form data
        const formData = {
            package_id: document.getElementById('package').value,
            customer_name: document.getElementById('customerName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            travel_date: document.getElementById('travelDate').value,
            num_adults: parseInt(document.getElementById('numAdults').value),
            num_children: parseInt(document.getElementById('numChildren').value),
            special_requests: document.getElementById('specialRequests').value
        };

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show success message
                successMessage.classList.add('show');
                
                // Reset form
                form.reset();
                
                // Hide package preview
                document.getElementById('packagePreview').style.display = 'none';

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 5000);
            } else {
                alert('Error submitting booking. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('Error submitting booking. Please check your connection and try again.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Booking Inquiry';
        }
    });
}

// Setup package preview on booking page
function setupPackagePreview() {
    const packageSelect = document.getElementById('package');
    
    if (!packageSelect) return;

    packageSelect.addEventListener('change', async () => {
        const packageId = packageSelect.value;
        
        if (!packageId) {
            document.getElementById('packagePreview').style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/packages/${packageId}`);
            const pkg = await response.json();

            const previewContent = document.getElementById('packagePreviewContent');
            const highlights = pkg.highlights ? pkg.highlights.split(',').map(h => h.trim()) : [];
            const inclusions = pkg.inclusions ? pkg.inclusions.split(',').map(i => i.trim()) : [];

            previewContent.innerHTML = `
                <div class="package-card">
                    <div class="package-header">
                        <h3>${pkg.title}</h3>
                        <div class="package-destination">${getDestinationEmoji(pkg.destination_name)} ${pkg.destination_name}, ${pkg.state}</div>
                    </div>
                    <div class="package-body">
                        <div class="package-details">
                            <div class="detail-item">
                                <span class="label">Duration</span>
                                <span class="value">⏰ ${pkg.duration}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Price</span>
                                <span class="value price">${formatCurrency(pkg.price)}</span>
                            </div>
                        </div>
                        
                        <p class="package-description">${pkg.description}</p>
                        
                        ${highlights.length > 0 ? `
                            <div class="package-highlights">
                                <h4>✨ Highlights</h4>
                                <ul>
                                    ${highlights.map(h => `<li>${h}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${inclusions.length > 0 ? `
                            <div class="package-highlights">
                                <h4>📦 Inclusions</h4>
                                <ul>
                                    ${inclusions.map(i => `<li>${i}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            document.getElementById('packagePreview').style.display = 'block';
        } catch (error) {
            console.error('Error loading package details:', error);
        }
    });
}

// Load bookings for admin page
async function loadBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: getAdminAuthHeaders()
        });

        if (response.status === 401) {
            sessionStorage.removeItem('adminAuth');
            sessionStorage.removeItem('adminUser');
            window.location.href = '/admin-login.html';
            return;
        }

        const bookings = await response.json();
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookings-container').innerHTML = 
            '<div class="empty-state"><h3>Error loading bookings</h3><p>Please try again later.</p></div>';
    }
}

// Display bookings in admin dashboard
function displayBookings(bookings) {
    const container = document.getElementById('bookings-container');
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No bookings yet</h3><p>Bookings will appear here once customers submit inquiries.</p></div>';
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Package</th>
                    <th>Travel Date</th>
                    <th>Adults/Children</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr id="booking-row-${booking.id}">
                        <td>${booking.id}</td>
                        <td>${booking.customer_name}</td>
                        <td>${booking.email}</td>
                        <td>${booking.phone}</td>
                        <td><strong>${booking.package_title || 'N/A'}</strong><br>
                            <small>${booking.destination_name || ''}</small>
                        </td>
                        <td>${new Date(booking.travel_date).toLocaleDateString()}</td>
                        <td>${booking.num_adults} / ${booking.num_children}</td>
                        <td>
                            <span class="status-badge status-${booking.status}">
                                ${booking.status.toUpperCase()}
                            </span>
                        </td>
                        <td>${new Date(booking.created_at).toLocaleDateString()}</td>
                        <td>
                            <div class="action-buttons">
                                <select onchange="updateBookingStatus(${booking.id}, this.value)">
                                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="in_process" ${booking.status === 'in_process' ? 'selected' : ''}>In Process</option>
                                    <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                                <button class="delete-btn" onclick="deleteBooking(${booking.id})">🗑️ Delete</button>
                            </div>
                        </td>
                    </tr>
                    ${booking.special_requests ? `
                        <tr style="background-color: #f9f9f9;">
                            <td colspan="10" style="padding: 0.5rem 1rem;">
                                <strong>Special Requests:</strong> ${booking.special_requests}
                            </td>
                        </tr>
                    ` : ''}
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// Update booking status
async function updateBookingStatus(bookingId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAdminAuthHeaders()
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            // Reload bookings to reflect changes
            loadBookings();
        } else {
            alert('Error updating status');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Error updating status. Please try again.');
    }
}

// Delete booking
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: getAdminAuthHeaders()
        });

        const result = await response.json();

        if (result.success) {
            // Remove row with animation
            const row = document.getElementById(`booking-row-${bookingId}`);
            if (row) {
                row.style.transition = 'opacity 0.3s ease';
                row.style.opacity = '0';
                setTimeout(() => {
                    loadBookings();
                }, 300);
            }
        } else {
            alert('Error deleting booking');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. Please try again.');
    }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and load appropriate content
    if (document.getElementById('destinations-container')) {
        loadDestinations();
    }
});

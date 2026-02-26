function goToMain() {
    const currentPage = window.location.href;
    if (!currentPage.includes('main.html')) {
        window.location.href = 'main.html';
    }
}

window.goToMain = goToMain;

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const indicator = document.querySelector('.nav-indicator');
    const topbarLeft = document.querySelector('.topbar-left');

    function updateIndicator(item) {
        const itemWidth = item.offsetWidth;
        const itemLeft = item.offsetLeft;
        
        indicator.style.width = itemWidth + 'px';
        indicator.style.left = itemLeft + 'px';
    }

    function setActiveNav(index) {
        navItems.forEach(item => item.classList.remove('active'));
        navItems[index].classList.add('active');
        updateIndicator(navItems[index]);
    }

    navItems.forEach((item, index) => {
        item.addEventListener('mouseenter', function() {
            updateIndicator(this);
        });

        item.addEventListener('click', function(e) {
            e.preventDefault();
            const navName = this.querySelector('a').dataset.nav;
            console.log('导航点击:', navName);
            
            if (navName === 'home') {
                const currentPage = window.location.href;
                if (currentPage.includes('main.html')) {
                    setActiveNav(index);
                } else {
                    goToMain();
                }
            } else {
                setActiveNav(index);
            }
        });
    });

    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem) {
        updateIndicator(activeItem);
    }

    window.addEventListener('resize', function() {
        const activeItem = document.querySelector('.nav-item.active');
        if (activeItem) {
            updateIndicator(activeItem);
        }
    });
});

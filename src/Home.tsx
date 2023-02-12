import Sheet from 'react-modal-sheet';
import { useState } from 'react';
import logo from './assets/mutiny-logo.svg';
import mutiny_m from './assets/m.svg';
import scan from './assets/scan.svg';
import settings from './assets/settings.svg';
import send from './assets/send.svg';


function ActivityItem() {
    return (
        <div className="flex flex-row border-b border-gray-500 gap-4 py-2">
            <img src={send} className="App-logo" alt="logo" />
            <div className='flex flex-col flex-1'>
                <h1>Bitcoin Beefsteak</h1>
                <h2>-1,441,851 SAT</h2>
                <h3 className='text-sm text-gray-500'>Jul 24</h3>
            </div>
            <div className='text-sm font-semibold uppercase text-[#E23A5E]'>SEND</div>
        </div>
    )
}

function App() {
    const [isOpen, setOpen] = useState(false);

    return (
        <div className="safe-top safe-left safe-right safe-bottom">
            <div className="disable-scrollbars max-h-screen h-full overflow-y-scroll mx-4">
                <main className='flex flex-col gap-4 py-8'>
                    <header>
                        <img src={logo} className="App-logo" alt="logo" />
                    </header>
                    <div className='border border-white rounded-xl border-b-4 p-4 flex flex-col gap-2'>
                        <header className='text-sm font-semibold uppercase'>
                            Balance
                        </header>
                        <div>
                            <h1 className='text-4xl font-light'>
                                69,420 <span className='text-xl'>SAT</span>
                            </h1>
                        </div>
                        <div className="flex gap-2 py-4">
                            <button onClick={() => setOpen(true)} className='bg-[#1EA67F] p-4 flex-1 rounded-xl text-xl font-semibold '><span className="drop-shadow-sm shadow-black">Send</span></button>
                            <button className='bg-[#3B6CCC] p-4 flex-1 rounded-xl text-xl font-semibold '><span className="drop-shadow-sm shadow-black">Receive</span></button>
                        </div>
                    </div>
                    <div className='rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)]'>
                        <header className='text-sm font-semibold uppercase'>
                            Activity
                        </header>
                        <ActivityItem />
                        <ActivityItem />
                        <ActivityItem />
                        <ActivityItem />
                        <ActivityItem />
                        <ActivityItem />
                        <ActivityItem />
                        <div className='flex justify-end py-4'>
                            <a href="#" className='underline text-sm'>
                                MORE
                            </a>
                        </div>
                    </div>
                    {/* safety div */}
                    <div className="h-32" />
                </main>


            </div>

            <Sheet isOpen={isOpen} onClose={() => setOpen(false)}>
                <Sheet.Container>
                    <Sheet.Header />
                    <Sheet.Content>
                        <div className='p-4 flex flex-col gap-2'>
                            <header className='text-sm font-semibold uppercase'>
                                Activity
                            </header>
                            <ActivityItem />
                            <h1 className='text-4xl font-light'>
                                It's a sheet! Like a modal, but a sheet.
                            </h1>
                        </div>
                    </Sheet.Content>
                </Sheet.Container>

                <Sheet.Backdrop />
            </Sheet>


            <nav className='bg-black fixed bottom-0 shadow-lg z-40 w-full safe-bottom'>
                <ul className='h-16 flex justify-between px-16 items-center'>
                    <li className='h-full border-t-2 border-b-2 border-b-black flex flex-col justify-center'>
                        <img src={mutiny_m} className="App-logo" alt="logo" />
                    </li>
                    <li>
                        <img src={scan} className="App-logo" alt="logo" />
                    </li>
                    <li>
                        <img src={settings} className="App-logo" alt="logo" />
                    </li>
                    {/* <li>home</li> */}
                    {/* <li>scan</li> */}
                    {/* <li>settings</li> */}
                </ul>
            </nav>



        </div >
    )
}

export default App
